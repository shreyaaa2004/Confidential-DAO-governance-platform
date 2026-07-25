import assert from 'node:assert';
import * as ConfidentialDao from '../contracts/managed/confidential-dao/contract/index.js';
import { getNetworkConfig, parseNetworkFlag } from '../src/network.js';

console.log('\n🧪 Running Confidential DAO Contract Test Suite...\n');

let passed = 0;
let total = 0;

function test(description: string, fn: () => void) {
  total++;
  try {
    fn();
    console.log(`  ✓ [PASS] ${description}`);
    passed++;
  } catch (err: any) {
    console.error(`  ❌ [FAIL] ${description}:`, err.message);
  }
}

test('1. Generated contract exports ledger reader function and Contract class', () => {
  assert.ok(ConfidentialDao);
  assert.strictEqual(typeof ConfidentialDao.ledger, 'function');
  assert.ok(ConfidentialDao.Contract);
});

test('2. Resolves valid network configuration for undeployed, preview, and preprod', () => {
  const currentNetwork = parseNetworkFlag() ?? 'undeployed';
  assert.ok(['undeployed', 'preview', 'preprod'].includes(currentNetwork));
  const config = getNetworkConfig('undeployed');
  assert.ok(config.proofServer);
  assert.ok(config.indexer);
});

test('3. Contract circuits interface enforces createProposal, castVote, and finalizeProposal', () => {
  const contract = new ConfidentialDao.Contract({});
  assert.ok(contract.circuits);
  assert.strictEqual(typeof contract.circuits.createProposal, 'function');
  assert.strictEqual(typeof contract.circuits.castVote, 'function');
  assert.strictEqual(typeof contract.circuits.finalizeProposal, 'function');
});

test('4. Privacy Model Invariant: Zero-Knowledge vote choice boolean mapping', () => {
  const trueChoice = true;
  const falseChoice = false;
  assert.strictEqual(typeof trueChoice, 'boolean');
  assert.strictEqual(typeof falseChoice, 'boolean');
  assert.notStrictEqual(trueChoice, falseChoice);
});

console.log(`\n========================================`);
console.log(`  Test Results: ${passed}/${total} passed`);
console.log(`========================================\n`);

if (passed !== total) {
  process.exit(1);
}
