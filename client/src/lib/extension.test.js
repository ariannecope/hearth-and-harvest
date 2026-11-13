import { test } from 'node:test';
import assert from 'node:assert/strict';
import { guessState, extensionFor, STATE_OPTIONS } from './extension.js';

test('guessState reads common location formats', () => {
  assert.equal(guessState('Asheville, NC'), 'NC');
  assert.equal(guessState('Portland OR 97201'), 'OR');
  assert.equal(guessState('Bozeman, Montana'), 'MT');
  assert.equal(guessState('Morgantown, West Virginia'), 'WV');
  assert.equal(guessState('Richmond, Virginia'), 'VA');
  assert.equal(guessState('28801'), null);
  assert.equal(guessState('Paris, France'), null);
});

test('every state and DC has an extension service', () => {
  assert.equal(STATE_OPTIONS.length, 51);
  assert.match(extensionFor('nc').url, /^https:\/\/.+/);
  assert.equal(extensionFor('ZZ'), null);
});
