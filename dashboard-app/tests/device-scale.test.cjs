const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const vm = require('node:vm');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../src/features/deviceSelect/deviceScale.ts'), 'utf8');
const context = {exports: {}};
vm.runInNewContext(ts.transpileModule(source, {compilerOptions: {module: ts.ModuleKind.CommonJS}}).outputText, context);
const {fitDeviceScale} = context.exports;
for (const [label, vw, vh, fw, fh] of [
  ['small portrait', 296, 456, 610, 1300],
  ['landscape', 616, 336, 1300, 610],
  ['large viewport', 1800, 1000, 610, 1300],
]) test(label + ' fits the complete frame with a uniform scale', () => {
  const scale = fitDeviceScale(vw, vh, fw, fh);
  assert.ok(scale > 0);
  assert.ok(fw * scale <= vw + 1e-9);
  assert.ok(fh * scale <= vh + 1e-9);
  assert.ok(Math.abs(fw * scale - vw) < 1e-9 || Math.abs(fh * scale - vh) < 1e-9);
});
test('hidden or invalid sizes never produce Infinity or NaN transforms', () => {
  for (const bad of [0, -1, NaN, Infinity]) {
    assert.equal(fitDeviceScale(300, 500, bad, 1000), 0);
    assert.equal(fitDeviceScale(bad, 500, 600, 1000), 0);
  }
});
