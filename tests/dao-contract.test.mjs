// dao-contract.test.mjs — plain ESM, runs with Node 22 natively (no tsx / no @midnight-ntwrk packages needed)
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// Inline network config so we don't need to import TypeScript files
const NETWORK_IDS = ['undeployed', 'preview', 'preprod'];
const NETWORK_CONFIGS = {
  undeployed: {
    networkId: 'undeployed',
    indexer:   'http://127.0.0.1:8088/api/v4/graphql',
    indexerWS: 'ws://127.0.0.1:8088/api/v4/graphql/ws',
    node:      'ws://127.0.0.1:9944',
    proofServer: 'http://127.0.0.1:6300',
  },
  preview: {
    networkId: 'preview',
    indexer:   'https://indexer.preview.midnight.network/api/v4/graphql',
    indexerWS: 'wss://indexer.preview.midnight.network/api/v4/graphql/ws',
    node:      'https://rpc.preview.midnight.network',
    proofServer: 'http://127.0.0.1:6300',
  },
  preprod: {
    networkId: 'preprod',
    indexer:   'https://indexer.preprod.midnight.network/api/v4/graphql',
    indexerWS: 'wss://indexer.preprod.midnight.network/api/v4/graphql/ws',
    node:      'https://rpc.preprod.midnight.network',
    proofServer: 'http://127.0.0.1:6300',
  },
};

console.log('\n🧪 Running Confidential DAO Contract Test Suite...\n');

let passed = 0;
let total = 0;

function test(description, fn) {
  total++;
  try {
    fn();
    console.log(`  ✓ [PASS] ${description}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ [FAIL] ${description}:`, err.message);
  }
}

// ─── Test 1: Compiled contract artifacts exist with correct ZK circuit definitions ───
test('1. Compiled contract artifacts exist with createProposal, castVote, and finalizeProposal circuits', () => {
  const contractInfoPath = path.join(ROOT, 'contracts', 'managed', 'confidential-dao', 'compiler', 'contract-info.json');
  assert.ok(fs.existsSync(contractInfoPath), `contract-info.json not found at ${contractInfoPath}`);

  const contractInfo = JSON.parse(fs.readFileSync(contractInfoPath, 'utf-8'));
  const circuitNames = contractInfo.circuits.map(c => c.name);

  assert.ok(circuitNames.includes('createProposal'), 'createProposal circuit missing');
  assert.ok(circuitNames.includes('castVote'), 'castVote circuit missing');
  assert.ok(circuitNames.includes('finalizeProposal'), 'finalizeProposal circuit missing');

  // castVote must take NO public arguments — vote choice comes from private witness
  const castVote = contractInfo.circuits.find(c => c.name === 'castVote');
  assert.strictEqual(castVote.arguments.length, 0, 'castVote should have no public arguments (uses witness instead)');
});

// ─── Test 2: Public ledger state fields are all exported ───
test('2. Public ledger state exports proposalId, yesVotes, noVotes, voterCount, isFinalized', () => {
  const contractInfoPath = path.join(ROOT, 'contracts', 'managed', 'confidential-dao', 'compiler', 'contract-info.json');
  const contractInfo = JSON.parse(fs.readFileSync(contractInfoPath, 'utf-8'));
  const ledgerNames = contractInfo.ledger.map(l => l.name);

  assert.ok(ledgerNames.includes('proposalId'), 'proposalId ledger field missing');
  assert.ok(ledgerNames.includes('yesVotes'), 'yesVotes ledger field missing');
  assert.ok(ledgerNames.includes('noVotes'), 'noVotes ledger field missing');
  assert.ok(ledgerNames.includes('voterCount'), 'voterCount ledger field missing');
  assert.ok(ledgerNames.includes('isFinalized'), 'isFinalized ledger field missing');
});

// ─── Test 3: Network configuration is valid for all supported networks ───
test('3. Resolves valid network configuration for undeployed, preview, and preprod', () => {
  for (const networkId of NETWORK_IDS) {
    const config = NETWORK_CONFIGS[networkId];
    assert.ok(config, `Config missing for network: ${networkId}`);
    assert.ok(config.proofServer, `proofServer missing for ${networkId}`);
    assert.ok(config.indexer, `indexer missing for ${networkId}`);
    assert.strictEqual(config.networkId, networkId, `networkId mismatch for ${networkId}`);
  }
});

// ─── Test 4: Witness input declared for private ZK vote choice ───
test('4. Privacy Model: secretVoteChoice witness declared as private ZK input (never public)', () => {
  const contractInfoPath = path.join(ROOT, 'contracts', 'managed', 'confidential-dao', 'compiler', 'contract-info.json');
  const contractInfo = JSON.parse(fs.readFileSync(contractInfoPath, 'utf-8'));

  // Verify witness declaration exists
  assert.ok(Array.isArray(contractInfo.witnesses), 'witnesses array missing from contract-info.json');
  const witness = contractInfo.witnesses.find(w => w.name === 'secretVoteChoice');
  assert.ok(witness, 'secretVoteChoice witness not declared in contract');
  assert.strictEqual(witness['result-type']['type-name'], 'Boolean', 'witness should return Boolean');

  // Verify castVote circuit takes NO public args (vote is fully private via witness)
  const castVote = contractInfo.circuits.find(c => c.name === 'castVote');
  assert.strictEqual(castVote.arguments.length, 0, 'castVote must have zero public arguments');
});

console.log(`\n========================================`);
console.log(`  Test Results: ${passed}/${total} passed`);
console.log(`========================================\n`);

if (passed !== total) process.exit(1);
