import test from 'node:test';
import assert from 'node:assert/strict';
import { sentenceSpans } from '../src/search.mjs';

test('sentenceSpans accurately segments text into sentence boundaries', () => {
  const text = 'Autonomous agents require firm deterministic boundaries. When error compounding occurs, success probability decays geometrically. Verification fatigue sets in rapidly.';
  const spans = sentenceSpans(text);
  assert.equal(spans.length, 3);
  assert.equal(spans[0].text, 'Autonomous agents require firm deterministic boundaries.');
  assert.equal(spans[1].text, 'When error compounding occurs, success probability decays geometrically.');
  assert.equal(spans[2].text, 'Verification fatigue sets in rapidly.');
  assert.equal(text.slice(spans[0].start, spans[0].end), spans[0].text);
});

test('sentenceSpans handles empty or invalid text safely', () => {
  assert.deepEqual(sentenceSpans(''), []);
  assert.deepEqual(sentenceSpans(null), []);
  assert.deepEqual(sentenceSpans(undefined), []);
  assert.deepEqual(sentenceSpans('   '), []);
});
