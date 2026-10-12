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

import { loadRaw } from '../src/load.mjs';
import { project, stationPath } from '../src/domain.mjs';
import { createRenderer } from '../src/render.mjs';

test('every station renders clean reading layout without intrusive search bars', () => {
  const data = loadRaw();
  const site = project(data);
  const renderer = createRenderer(site);
  for (const s of site.stations) {
    const page = renderer.pages.find(p => p.path === stationPath(s));
    assert.ok(page, `Station page not found for ${s.id}`);
    assert.ok(page.body.includes(`data-station-page="${s.id}"`), `Station ${s.id} missing data-station-page attribute`);
    assert.ok(!page.body.includes('data-needle-bar'), `Station ${s.id} should not contain data-needle-bar`);
    assert.ok(!page.body.includes('data-needle-input'), `Station ${s.id} should not contain data-needle-input`);
    assert.ok(!page.body.includes('station-needle-bar'), `Station ${s.id} should not have station-needle-bar in reading body`);
  }
});
