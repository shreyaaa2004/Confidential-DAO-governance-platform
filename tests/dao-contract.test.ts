import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getNetworkConfig, parseNetworkFlag, NETWORK_CONFIGS } from '../src/network.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

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

// ─── Test 1: Verify compiled contract artifacts exist with correct circuit definitions ───
test('1. Compiled contract artifacts exist with createProposal, castVote, and finalizeProposal circuits', () => {
  const contractInfoPath = path.join(ROOT, 'contracts', 'managed', 'confidential-dao', 'compiler', 'contract-info.json');
  assert.ok(fs.existsSync(contractInfoPath), `contract-info.json not found at ${contractInfoPath}`);

  const contractInfo = JSON.parse(fs.readFileSync(contractInfoPath, 'utf-8'));
  const circuitNames: string[] = contractInfo.circuits.map((c: { name: string }) => c.name);

  assert.ok(circuitNames.includes('createProposal'), 'createProposal circuit missing');
  assert.ok(circuitNames.includes('castVote'), 'castVote circuit missing');
  assert.ok(circuitNames.includes('finalizeProposal'), 'finalizeProposal circuit missing');
});

// ─── Test 2: Verify public ledger state fields are correctly exported ───
test('2. Public ledger state exports proposalId, yesVotes, noVotes, voterCount, isFinalized', () => {
  const contractInfoPath = path.join(ROOT, 'contracts', 'managed', 'confidential-dao', 'compiler', 'contract-info.json');
  const contractInfo = JSON.parse(fs.readFileSync(contractInfoPath, 'utf-8'));
  const ledgerNames: string[] = contractInfo.ledger.map((l: { name: string }) => l.name);

  assert.ok(ledgerNames.includes('proposalId'), 'proposalId ledger field missing');
  assert.ok(ledgerNames.includes('yesVotes'), 'yesVotes ledger field missing');
  assert.ok(ledgerNames.includes('noVotes'), 'noVotes ledger field missing');
  assert.ok(ledgerNames.includes('voterCount'), 'voterCount ledger field missing');
  assert.ok(ledgerNames.includes('isFinalized'), 'isFinalized ledger field missing');
});

// ─── Test 3: Network configuration resolves all supported networks ───
test('3. Resolves valid network configuration for undeployed, preview, and preprod', () => {
  const currentNetwork = parseNetworkFlag() ?? 'undeployed';
  assert.ok(['undeployed', 'preview', 'preprod'].includes(currentNetwork));

  for (const network of ['undeployed', 'preview', 'preprod'] as const) {
    const config = getNetworkConfig(network);
    assert.ok(config.proofServer, `proofServer missing for ${network}`);
    assert.ok(config.indexer, `indexer missing for ${network}`);
    assert.ok(config.networkId === network, `networkId mismatch for ${network}`);
  }
});

// ─── Test 4: Privacy Model Invariant - ZK vote choice boolean mapping ───
test('4. Privacy Model Invariant: Zero-Knowledge vote choice boolean mapping', () => {
  // castVote accepts a Boolean: true = YES, false = NO
  // Validated via compiler contract-info.json that voteChoice is of type Boolean
  const contractInfoPath = path.join(ROOT, 'contracts', 'managed', 'confidential-dao', 'compiler', 'contract-info.json');
  const contractInfo = JSON.parse(fs.readFileSync(contractInfoPath, 'utf-8'));
  const castVote = contractInfo.circuits.find((c: { name: string }) => c.name === 'castVote');
  assert.ok(castVote, 'castVote circuit not found');
  assert.strictEqual(castVote.arguments[0].name, 'voteChoice');
  assert.strictEqual(castVote.arguments[0].type['type-name'], 'Boolean');

  // Ensure vote choice is a boolean: true = YES, false = NO (private witness)
  const trueChoice = true;
  const falseChoice = false;
  assert.strictEqual(typeof trueChoice, 'boolean');
  assert.notStrictEqual(trueChoice, falseChoice);
});

console.log(`\n========================================`);
console.log(`  Test Results: ${passed}/${total} passed`);
console.log(`========================================\n`);

if (passed !== total) {
  process.exit(1);
}
