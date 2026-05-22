#!/usr/bin/env node
function videoSelector() {
  return "document.querySelector('video')";
}

export function seekSnippet(seconds) {
  const target = Number(seconds);
  return `(() => {
  const video = ${videoSelector()};
  if (!video) throw new Error("No video element found.");
  video.currentTime = ${Number.isFinite(target) ? target : 0};
  return video.currentTime;
})()`;
}

export function playSnippet() {
  return `(() => {
  const video = ${videoSelector()};
  if (!video) throw new Error("No video element found.");
  video.play();
  return video.currentTime;
})()`;
}

export function pauseSnippet() {
  return `(() => {
  const video = ${videoSelector()};
  if (!video) throw new Error("No video element found.");
  video.pause();
  return video.currentTime;
})()`;
}

export function currentTimeSnippet() {
  return `(() => {
  const video = ${videoSelector()};
  if (!video) throw new Error("No video element found.");
  return video.currentTime;
})()`;
}

export function reachedTimeSnippet(seconds) {
  const target = Number(seconds);
  return `(() => {
  const video = ${videoSelector()};
  if (!video) throw new Error("No video element found.");
  return video.currentTime >= ${Number.isFinite(target) ? target : 0};
})()`;
}

function main(argv) {
  const [command, value] = argv;

  if (command === "seek") {
    console.log(seekSnippet(value));
    return;
  }
  if (command === "play") {
    console.log(playSnippet());
    return;
  }
  if (command === "pause") {
    console.log(pauseSnippet());
    return;
  }
  if (command === "current-time") {
    console.log(currentTimeSnippet());
    return;
  }
  if (command === "reached") {
    console.log(reachedTimeSnippet(value));
    return;
  }

  console.log("Usage: node control-video.js <seek|play|pause|current-time|reached> [seconds]");
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].replaceAll("\\", "/"))) {
  main(process.argv.slice(2));
}
