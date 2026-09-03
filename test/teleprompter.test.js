'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const inlineScript = source.match(/<script>([\s\S]+)<\/script>/)?.[1];

test('the distributable stays self-contained and local-only', () => {
  assert.match(source, /<textarea[^>]+id="script-input"/);
  assert.match(source, /localStorage/);
  assert.match(source, /prefers-reduced-motion/);
  assert.doesNotMatch(source, /<script[^>]+src=|<link[^>]+rel="stylesheet"/i);
  assert.doesNotMatch(source, /\b(?:fetch|XMLHttpRequest|WebSocket|EventSource|getUserMedia)\s*\(/);
  assert.ok(inlineScript, 'the app must contain its executable behavior inline');
  assert.doesNotThrow(() => new vm.Script(inlineScript), 'the inline script must parse');
});

test('the primary controls and accessible states remain present', () => {
  assert.match(source, /id="start-button"/);
  assert.match(source, /id="pause-button"/);
  assert.match(source, /id="restart-button"/);
  assert.match(source, /id="speed-control"[^>]+type="range"/);
  assert.match(source, /id="size-control"[^>]+type="range"/);
  assert.match(source, /id="mirror-toggle"[^>]+type="checkbox"/);
  assert.match(source, /id="highlight-toggle"[^>]+type="checkbox"/);
  assert.match(source, /aria-live="polite"/);
  assert.match(source, /requestFullscreen/);
});

test('word cues use elapsed spoken time and fullscreen settles before measurement', () => {
  assert.match(inlineScript, /const READOUT_INTERVAL_MS = 250/);
  assert.match(inlineScript, /const MAX_HIGHLIGHT_WORDS = 5_000/);
  assert.match(inlineScript, /advanceWordProgress\(\s*spokenWordProgress,\s*delta,\s*Number\(speedControl\.value\)\s*\)/);
  assert.match(inlineScript, /wordIndexAtProgress\(spokenWordProgress, wordCues\.length\)/);

  const cueClockStart = inlineScript.indexOf('function advanceWordProgress(');
  const cueClockEnd = inlineScript.indexOf('function clearCurrentWord()', cueClockStart);
  assert.ok(cueClockStart >= 0 && cueClockEnd > cueClockStart);
  const cueContext = {};
  vm.runInNewContext(`${inlineScript.slice(cueClockStart, cueClockEnd)}
    let progress = advanceWordProgress(0, 30_000, 120);
    result = [
      wordIndexAtProgress(0, 0),
      wordIndexAtProgress(progress, 200),
      wordIndexAtProgress(progress = advanceWordProgress(progress, 500, 240), 200),
      progress,
      wordIndexAtProgress(5_000, 4)
    ];`, cueContext);
  assert.equal(JSON.stringify(cueContext.result), JSON.stringify([-1, 60, 62, 62, 3]));

  const startSource = inlineScript.slice(
    inlineScript.indexOf('async function startOneShot()'),
    inlineScript.indexOf('function pause()')
  );
  const fullscreenAwait = startSource.indexOf('await requestPromptFullscreen()');
  const finalMeasure = startSource.lastIndexOf('refreshMotionMetrics()');
  const countdownStart = startSource.indexOf('beginCountdown(');
  assert.ok(fullscreenAwait >= 0, 'automatic fullscreen must be awaited');
  assert.ok(finalMeasure > fullscreenAwait, 'geometry must be measured after fullscreen settles');
  assert.ok(countdownStart > finalMeasure, 'countdown must start after final geometry measurement');
});
