/**
 * Deploy confidential-dao contract to a Midnight network.
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { resolveNetwork, getOrCreateSeed, recordDeployment } from './network.js';
import { createWallet, persistWalletState, unshieldedToken, type WalletContext } from './wallet.js';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { WebSocket } from 'ws';
import * as Rx from 'rxjs';

// Midnight SDK imports
import { deployContract } from '@midnight-ntwrk/midnight-js-contracts';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js';
import * as ConfidentialDao from '../contracts/managed/confidential-dao/contract/index.js';

// @ts-expect-error Required for wallet sync
globalThis.WebSocket = WebSocket;

const PRIVATE_STATE_ID = 'confidentialDaoPrivateState';

const { network, config: networkConfig } = resolveNetwork();
const SEED = getOrCreateSeed(network);

async function checkProofServer(url: string): Promise<boolean> {
  try {
    const res = await fetch(`${url}/health`);
    return res.ok;
  } catch {
    return false;
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log('\n================================================================');
  console.log(`  Deploying confidential-dao to: ${network.toUpperCase()}`);
  console.log('================================================================\n');

  console.log(`  Network ID:     ${networkConfig.networkId}`);
  console.log(`  Node URL:       ${networkConfig.node}`);
  console.log(`  Indexer URL:    ${networkConfig.indexer}`);
  console.log(`  Indexer WS:     ${networkConfig.indexerWS}`);
  console.log(`  Proof Server:   ${networkConfig.proofServer}\n`);

  // 1. Proof server check
  const proofServerOk = await checkProofServer(networkConfig.proofServer);
  if (!proofServerOk) {
    if (network === 'undeployed') {
      console.error(`❌ Proof server not running at ${networkConfig.proofServer}`);
      console.error('   Start it with: npm run proof-server:start\n');
    } else {
      console.error(`❌ Cannot reach proof server at ${networkConfig.proofServer}\n`);
    }
    process.exit(1);
  }
  console.log('  ✓ Proof server is ready.\n');

  // 2. Load contract artifacts
  const zkConfigPath = path.resolve(__dirname, '..', 'contracts', 'managed', 'confidential-dao');
  if (!fs.existsSync(zkConfigPath)) {
    console.error(`❌ Managed contract artifacts missing at ${zkConfigPath}`);
    console.error('   Run: npm run compile\n');
    process.exit(1);
  }

  const compiledContract = CompiledContract.make('confidential-dao', ConfidentialDao.Contract as any).pipe(
    CompiledContract.withWitnesses({}),
  );

  // 3. Wallet creation & sync
  console.log('  Creating wallet...');
  const walletCtx = await createWallet({ network, networkConfig, seed: SEED });

  const walletAddress = walletCtx.unshieldedKeystore.getBech32Address().toString();
  console.log(`  Wallet Address: ${walletAddress}\n`);

  console.log('  Syncing wallet with network...');
  const syncStart = Date.now();
  const syncInterval = setInterval(() => {
    const elapsed = Math.round((Date.now() - syncStart) / 1000);
    process.stdout.write(`\r  ⏳ Syncing... (${elapsed}s elapsed)   `);
  }, 5000);

  let state;
  try {
    // Add 120s timeout for public networks
    const syncPromise = walletCtx.wallet.waitForSyncedState();
    if (network !== 'undeployed') {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Preprod wallet sync timeout (120s limit reached)')), 120000),
      );
      state = (await Promise.race([syncPromise, timeoutPromise])) as any;
    } else {
      state = await syncPromise;
    }
    clearInterval(syncInterval);
    process.stdout.write('\r  ✓ Wallet synced successfully.                              \n\n');
  } catch (err: any) {
    clearInterval(syncInterval);
    console.error('\n  ❌ Wallet Sync Error:', err.message);
    if (network !== 'undeployed') {
      console.log('  ⚠ Wallet sync blocked or timed out on Preprod.');
      console.log('  ⚠ Preserving wallet state in .midnight-state.json.');
      console.log(`  ⚠ Faucet URL: ${networkConfig.faucet}`);
      console.log(`  ⚠ Wallet Address for funding: ${walletAddress}`);
      process.exit(1);
    }
    throw err;
  }

  await persistWalletState(network, walletCtx);

  const balance = state.unshielded.balances[unshieldedToken().raw] ?? 0n;
  console.log(`  Balance: ${balance.toLocaleString()} tNight`);

  if (balance === 0n && network !== 'undeployed') {
    console.error('\n❌ Wallet has 0 tNight. Please fund address via faucet:');
    console.error(`   ${networkConfig.faucet}`);
    console.error(`   Wallet Address: ${walletAddress}\n`);
    process.exit(1);
  }

  // 4. Create Providers
  console.log('\n  Configuring Midnight Providers...');
  const privateStatePassword = process.env.PRIVATE_STATE_PASSWORD?.trim() || 'Local-Devnet-Development-Placeholder-1';
  const zkConfigProvider = new NodeZkConfigProvider(zkConfigPath);
  const accountId = walletAddress;

  const walletProvider = {
    getCoinPublicKey: () => walletCtx.shieldedSecretKeys.coinPublicKey,
    getEncryptionPublicKey: () => walletCtx.shieldedSecretKeys.encryptionPublicKey,
    async balanceTx(tx: any, ttl?: Date) {
      const recipe = await walletCtx.wallet.balanceUnboundTransaction(
        tx,
        { shieldedSecretKeys: walletCtx.shieldedSecretKeys, dustSecretKey: walletCtx.dustSecretKey },
        { ttl: ttl ?? new Date(Date.now() + 30 * 60 * 1000) },
      );
      return walletCtx.wallet.finalizeRecipe(recipe);
    },
    submitTx: (tx: any) => walletCtx.wallet.submitTransaction(tx) as any,
  };

  const providers = {
    privateStateProvider: levelPrivateStateProvider({
      privateStateStoreName: 'confidential-dao-state',
      accountId,
      privateStoragePasswordProvider: () => privateStatePassword,
    }),
    publicDataProvider: indexerPublicDataProvider(networkConfig.indexer, networkConfig.indexerWS),
    zkConfigProvider,
    proofProvider: httpClientProofProvider(networkConfig.proofServer, zkConfigProvider),
    walletProvider,
    midnightProvider: walletProvider,
  };

  // 5. Deploy Contract
  console.log('  Submitting deploy transaction to Midnight network...');
  const startTime = Date.now();

  const deployedContract: any = await deployContract(providers, {
    compiledContract: compiledContract as any,
    privateStateId: PRIVATE_STATE_ID,
    initialPrivateState: {},
  });

  const duration = Math.round((Date.now() - startTime) / 1000);
  const contractAddress = deployedContract.deployTx.contractAddress;

  console.log('\n  ================================================================');
  console.log('  🎉 Deployment Successful!');
  console.log('  ================================================================');
  console.log(`  Contract Address: ${contractAddress}`);
  console.log(`  Deployment Time:  ${duration}s\n`);

  recordDeployment(network, contractAddress);
  await persistWalletState(network, walletCtx);
  await walletCtx.wallet.stop();
}

main().catch((err) => {
  console.error('\n❌ Deployment Failed:', err instanceof Error ? err.message : err);
  process.exit(1);
});
