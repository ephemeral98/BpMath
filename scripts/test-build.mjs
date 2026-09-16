import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

import * as esm from '../build/index.js';

const require = createRequire(import.meta.url);
const cjs = require('../build/index.cjs');

for (const entry of [esm, cjs]) {
  assert.equal(entry.bpAdd('0.1', '0.2'), '0.3');
  assert.equal(entry.bpGt('9007199254740993', '9007199254740992'), true);
  assert.equal(entry.bpFloor('-1.231', 2), '-1.24');
}
