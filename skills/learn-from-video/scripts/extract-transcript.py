#!/usr/bin/env python3
"""Best-effort YouTube transcript extraction helper for learn-from-video."""

from __future__ import annotations

import argparse
import json
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path
from urllib.parse import parse_qs, urlparse


VIDEO_ID_RE = re.compile(r"^[A-Za-z0-9_-]{11}$")
TIMESTAMP_RE = re.compile(
    r"(?P<start>\d{1,2}:\d{2}(?::\d{2})?(?:[.,]\d{1,3})?)\s+-->\s+"
    r"(?P<end>\d{1,2}:\d{2}(?::\d{2})?(?:[.,]\d{1,3})?)"
)


def main() -> int:
    parser = argparse.ArgumentParser(description="Extract a YouTube transcript as JSON.")
    parser.add_argument("url_or_id", help="YouTube URL or raw 11-character video ID")
    parser.add_argument("--json", action="store_true", help="Print transcript JSON. This is the default output.")
    args = parser.parse_args()

    video_id = parse_video_id(args.url_or_id)
    if not video_id:
        print("Could not parse a YouTube video ID.", file=sys.stderr)
        return 2

    transcript = try_ytdlp(args.url_or_id)
    if transcript:
        print(json.dumps(transcript, ensure_ascii=True, indent=2))
        return 0

    transcript = try_youtube_transcript_api(video_id)
    if transcript:
        print(json.dumps(transcript, ensure_ascii=True, indent=2))
        return 0

    print(
        "No transcript found. Install yt-dlp or youtube-transcript-api, or use browser transcript scraping.",
        file=sys.stderr,
    )
    return 1


def parse_video_id(value: str) -> str | None:
    value = value.strip()
    if VIDEO_ID_RE.match(value):
        return value

    parsed = urlparse(value)
    host = parsed.netloc.lower().removeprefix("www.")
    if host in {"youtube.com", "m.youtube.com"}:
        query_id = parse_qs(parsed.query).get("v", [None])[0]
        if query_id and VIDEO_ID_RE.match(query_id):
            return query_id
        shorts_match = re.match(r"^/shorts/([A-Za-z0-9_-]{11})", parsed.path)
        if shorts_match:
            return shorts_match.group(1)
    if host == "youtu.be":
        candidate = parsed.path.strip("/").split("/")[0]
        if VIDEO_ID_RE.match(candidate):
            return candidate
    return None


def try_ytdlp(url_or_id: str) -> list[dict] | None:
    executable = shutil.which("yt-dlp")
    if not executable:
        return None

    url = url_or_id if url_or_id.startswith(("http://", "https://")) else f"https://www.youtube.com/watch?v={url_or_id}"
    with tempfile.TemporaryDirectory(prefix="learn-from-video-") as temp_dir:
        temp_path = Path(temp_dir)
        command = [
            executable,
            "--write-subs",
            "--write-auto-subs",
            "--skip-download",
            "--sub-langs",
            "en",
            "--sub-format",
            "vtt",
            "-o",
            "%(id)s.%(ext)s",
            url,
        ]
        try:
            subprocess.run(command, cwd=temp_path, capture_output=True, text=True, check=False)
        except OSError:
            return None

        for vtt_file in temp_path.glob("*.vtt"):
            transcript = parse_vtt(vtt_file.read_text(encoding="utf-8", errors="replace"))
            if transcript:
                return transcript
    return None


def parse_vtt(content: str) -> list[dict]:
    entries: list[dict] = []
    lines = content.splitlines()
    index = 0

    while index < len(lines):
        match = TIMESTAMP_RE.search(lines[index])
        if not match:
            index += 1
            continue

        start = parse_timestamp(match.group("start"))
        end = parse_timestamp(match.group("end"))
        index += 1
        text_lines: list[str] = []

        while index < len(lines) and lines[index].strip():
            cleaned = clean_caption_line(lines[index])
            if cleaned:
                text_lines.append(cleaned)
            index += 1

        text = " ".join(text_lines).strip()
        if text:
            entries.append({
                "start": start,
                "duration": max(0.0, end - start),
                "text": text,
            })
        index += 1

    return dedupe_entries(entries)


def parse_timestamp(value: str) -> float:
    normalized = value.replace(",", ".")
    parts = normalized.split(":")
    seconds = float(parts[-1])
    minutes = int(parts[-2]) if len(parts) >= 2 else 0
    hours = int(parts[-3]) if len(parts) >= 3 else 0
    return hours * 3600 + minutes * 60 + seconds


def clean_caption_line(line: str) -> str:
    line = re.sub(r"<[^>]+>", "", line)
    line = re.sub(r"&amp;", "&", line)
    line = re.sub(r"&lt;", "<", line)
    line = re.sub(r"&gt;", ">", line)
    return line.strip()


def dedupe_entries(entries: list[dict]) -> list[dict]:
    deduped: list[dict] = []
    previous = ""
    for entry in entries:
        text = entry["text"]
        if text == previous:
            continue
        deduped.append(entry)
        previous = text
    return deduped


def try_youtube_transcript_api(video_id: str) -> list[dict] | None:
    try:
        from youtube_transcript_api import YouTubeTranscriptApi  # type: ignore
    except ImportError:
        return None

    try:
        transcript = YouTubeTranscriptApi.get_transcript(video_id)
    except Exception:
        try:
            api = YouTubeTranscriptApi()
            fetched = api.fetch(video_id)
            transcript = [
                {"start": item.start, "duration": item.duration, "text": item.text}
                for item in fetched
            ]
        except Exception:
            return None

    return [
        {
            "start": float(item.get("start", 0)),
            "duration": float(item.get("duration", 0)),
            "text": str(item.get("text", "")).strip(),
        }
        for item in transcript
        if str(item.get("text", "")).strip()
    ]


if __name__ == "__main__":
    raise SystemExit(main())

