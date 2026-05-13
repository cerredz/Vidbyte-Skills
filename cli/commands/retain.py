import json
from datetime import datetime, timezone

from ..auth.sanitize import Sanitizer
from ..client import VidbyteRequestBuilder
from ..helpers import format_response, read_package_version


DEFAULT_RETAIN_SKILL_ID = "retain-v1"
MAX_CONCEPTS = 5
MAX_QUESTIONS = 6
MAX_PROBLEMS = 2
MAX_REVIEWS = 3


class RetainCommand:

    def submit(self, options: dict) -> str | None:
        sanitized = _sanitize_options(options)
        _reject_unknown_options(sanitized)

        generated_at = datetime.now(timezone.utc).isoformat()
        concepts = _collect_concepts(sanitized)
        questions = _collect_questions(sanitized)
        problems = _collect_problems(sanitized)
        reviews = _collect_reviews(sanitized)

        module = {
            "version": 1,
            "type": "retain_module",
            "title": sanitized.get("title", "Session retention module"),
            "estimated_minutes": 15,
            "source": {
                "domain": sanitized.get("domain", "unknown"),
                "conversation_id": sanitized.get("conversation-id", ""),
                "generated_at": generated_at,
            },
            "access": {
                "free_phase": "brain_dump",
                "premium_required_for_full_module": True,
            },
            "concepts": concepts,
            "phases": [
                {
                    "id": "encoding_anchors",
                    "title": "Encoding Anchors",
                    "duration_seconds": 120,
                    "locked_until_timer_complete": True,
                    "items": concepts,
                },
                {
                    "id": "brain_dump",
                    "title": "Brain Dump",
                    "duration_seconds": 120,
                    "locked_until_timer_complete": False,
                    "prompt": sanitized.get(
                        "brain-dump-prompt",
                        "Write everything you remember from the conversation. Do not look back. Do not organize. Just output.",
                    ),
                    "expected_concept_ids": [concept["id"] for concept in concepts],
                },
                {
                    "id": "cued_recall",
                    "title": "Cued Recall",
                    "duration_seconds": 300,
                    "reveal": "one_at_a_time",
                    "items": questions,
                },
                {
                    "id": "active_reasoning",
                    "title": "Active Reasoning Problems",
                    "duration_seconds": 240,
                    "items": problems,
                },
                {
                    "id": "gap_analysis",
                    "title": "Gap Analysis",
                    "duration_seconds": 120,
                    "concept_ids": [concept["id"] for concept in concepts],
                    "question_ids": [question["id"] for question in questions],
                    "problem_ids": [problem["id"] for problem in problems],
                },
            ],
            "review_schedule": reviews,
        }

        payload = json.dumps({
            "type": "retain",
            "domain": sanitized.get("domain", "unknown"),
            "conversation_id": sanitized.get("conversation-id", ""),
            "module": module,
            "generated_at": generated_at,
        })

        builder = VidbyteRequestBuilder(
            body=payload,
            cli_version=read_package_version(),
            endpoint_name="retain",
            skill_id=sanitized.get("skill-id") or DEFAULT_RETAIN_SKILL_ID,
        )

        if sanitized.get("dry-run"):
            result = builder.dry_run()
            result["validated"] = True
            result["concept_count"] = len(concepts)
            result["question_count"] = len(questions)
            result["problem_count"] = len(problems)
            result["review_count"] = len(reviews)
            return json.dumps(result, indent=2)

        response = builder.request() or {}
        url = response.get("url", "")
        if url:
            return f"Your retention exercise is ready on {url}"
        return format_response(response)


def _sanitize_options(options: dict) -> dict:
    sanitizer = Sanitizer()
    sanitized = {}
    for key, value in options.items():
        if value is True:
            sanitized[key] = value
            continue
        if not isinstance(value, str):
            sanitized[key] = value
            continue
        cleaned = sanitizer.sanitize(value).strip()
        if cleaned:
            sanitized[key] = cleaned
    return sanitized


def _reject_unknown_options(options: dict) -> None:
    allowed = {
        "title",
        "domain",
        "conversation-id",
        "skill-id",
        "dry-run",
        "brain-dump-prompt",
    }
    for i in range(1, MAX_CONCEPTS + 1):
        allowed.update({
            f"concept{i}-name",
            f"concept{i}-distillation",
            f"concept{i}-anchor",
            f"concept{i}-hook",
        })
    for i in range(1, MAX_QUESTIONS + 1):
        allowed.update({f"question{i}", f"answer{i}"})
    for i in range(1, MAX_PROBLEMS + 1):
        allowed.update({
            f"problem{i}-scenario",
            f"problem{i}-question",
            f"problem{i}-criteria",
        })
    for i in range(1, MAX_REVIEWS + 1):
        allowed.add(f"review{i}")

    unknown = sorted(key for key in options.keys() if key not in allowed)
    if unknown:
        raise RuntimeError(f"Unknown retain option(s): {', '.join('--' + key for key in unknown)}.")


def _collect_concepts(options: dict) -> list[dict]:
    concepts = []
    for i in range(1, MAX_CONCEPTS + 1):
        values = {
            "name": options.get(f"concept{i}-name", ""),
            "distillation": options.get(f"concept{i}-distillation", ""),
            "anchor": options.get(f"concept{i}-anchor", ""),
            "hook": options.get(f"concept{i}-hook", ""),
        }
        if not any(values.values()):
            continue
        _require_group(f"concept{i}", values, {
            "name": f"--concept{i}-name",
            "distillation": f"--concept{i}-distillation",
            "anchor": f"--concept{i}-anchor",
            "hook": f"--concept{i}-hook",
        })
        concepts.append({
            "id": f"concept-{len(concepts) + 1}",
            "name": values["name"],
            "distillation": values["distillation"],
            "vivid_anchor": values["anchor"],
            "personal_hook": values["hook"],
        })

    if not concepts:
        raise RuntimeError(
            "Missing retain concepts. Provide at least --concept1-name, "
            "--concept1-distillation, --concept1-anchor, and --concept1-hook."
        )
    return concepts


def _collect_questions(options: dict) -> list[dict]:
    questions = []
    for i in range(1, MAX_QUESTIONS + 1):
        prompt = options.get(f"question{i}", "")
        answer = options.get(f"answer{i}", "")
        if not prompt and not answer:
            continue
        if not prompt:
            raise RuntimeError(f"Missing --question{i} for --answer{i}.")
        if not answer:
            raise RuntimeError(f"Missing --answer{i} for --question{i}.")
        questions.append({
            "id": f"question-{len(questions) + 1}",
            "prompt": prompt,
            "answer_key": answer,
            "difficulty": _question_difficulty(len(questions) + 1),
        })

    if not questions:
        raise RuntimeError("Missing retain questions. Provide at least --question1 and --answer1.")
    return questions


def _collect_problems(options: dict) -> list[dict]:
    problems = []
    for i in range(1, MAX_PROBLEMS + 1):
        values = {
            "scenario": options.get(f"problem{i}-scenario", ""),
            "question": options.get(f"problem{i}-question", ""),
            "criteria": options.get(f"problem{i}-criteria", ""),
        }
        if not any(values.values()):
            continue
        _require_group(f"problem{i}", values, {
            "scenario": f"--problem{i}-scenario",
            "question": f"--problem{i}-question",
            "criteria": f"--problem{i}-criteria",
        })
        problems.append({
            "id": f"problem-{len(problems) + 1}",
            "scenario": values["scenario"],
            "question": values["question"],
            "strong_answer_criteria": values["criteria"],
        })
    return problems


def _collect_reviews(options: dict) -> list[dict]:
    defaults = [
        ("1 day", "Re-answer the hardest cued recall question without looking."),
        ("3 days", "Redo one active reasoning problem in a new context."),
        ("7 days", "Explain the most important concept from memory in one paragraph."),
    ]
    reviews = []
    for i in range(1, MAX_REVIEWS + 1):
        prompt = options.get(f"review{i}")
        if not prompt:
            continue
        after = defaults[i - 1][0]
        reviews.append({"after": after, "prompt": prompt})

    if reviews:
        return reviews
    return [{"after": after, "prompt": prompt} for after, prompt in defaults]


def _require_group(label: str, values: dict, flags: dict) -> None:
    missing = [flags[key] for key, value in values.items() if not value]
    if missing:
        raise RuntimeError(f"Incomplete {label}; missing {', '.join(missing)}.")


def _question_difficulty(index: int) -> str:
    if index <= 2:
        return "retrieval"
    if index <= 4:
        return "connection"
    return "transfer"
