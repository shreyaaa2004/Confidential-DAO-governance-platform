import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { levelPrivateStateProvider } from "@midnight-ntwrk/midnight-js-level-private-state-provider";
import { indexerPublicDataProvider } from "@midnight-ntwrk/midnight-js-indexer-public-data-provider";
import { NodeZkConfigProvider } from "@midnight-ntwrk/midnight-js-node-zk-config-provider";
import { httpClientProofProvider } from "@midnight-ntwrk/midnight-js-http-client-proof-provider";
import { CompiledContract, findDeployedContract } from "@midnight-ntwrk/midnight-js-contracts";
import { unshieldedToken } from "@midnight-ntwrk/ledger";
import { createWallet, persistWalletState } from "./wallet.js";
import { getNetworkConfig, getDeployment, parseNetworkFlag } from "./network.js";
import * as ConfidentialDao from "../contracts/managed/confidential-dao/contract/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PRIVATE_STATE_ID = "0000000000000000000000000000000000000000000000000000000000000001";
const SEED = "0000000000000000000000000000000000000000000000000000000000000001";

const network = parseNetworkFlag();
const networkConfig = getNetworkConfig(network);

async function createProviders(walletCtx: any) {
  const zkConfigPath = path.resolve(__dirname, "..", "contracts", "managed", "confidential-dao");
  const privateStatePassword = process.env.PRIVATE_STATE_PASSWORD?.trim() || "Local-Devnet-Development-Placeholder-1";

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

  const zkConfigProvider = new NodeZkConfigProvider(zkConfigPath);
  const accountId = walletCtx.unshieldedKeystore.getBech32Address().toString();

  return {
    privateStateProvider: levelPrivateStateProvider({
      privateStateStoreName: "confidential-dao-state",
      accountId,
      privateStoragePasswordProvider: () => privateStatePassword,
    }),
    publicDataProvider: indexerPublicDataProvider(networkConfig.indexer, networkConfig.indexerWS),
    zkConfigProvider,
    proofProvider: httpClientProofProvider(networkConfig.proofServer, zkConfigProvider),
    walletProvider,
    midnightProvider: walletProvider,
  };
}

async function main() {
  console.log("\n╔══════════════════════════════════════════════════════════════╗");
  console.log("║             Confidential DAO Governance Platform CLI          ║");
  console.log("╚══════════════════════════════════════════════════════════════╝\n");

  const rl = createInterface({ input: stdin, output: stdout });

  const deployment = getDeployment(network);
  if (!deployment) {
    console.error(`No deploy on file for network ${network}. Run \`npm run setup -- --network ${network}\` first.`);
    process.exit(1);
  }
  console.log(`  Contract Address: ${deployment.address}`);
  console.log(`  Network: ${network}\n`);

  try {
    console.log("  Connecting to wallet...");
    const walletCtx = await createWallet({ network, networkConfig, seed: SEED });
    const state = await walletCtx.wallet.waitForSyncedState();
    await persistWalletState(network, walletCtx);
    const balance = state.unshielded.balances[unshieldedToken().raw] ?? 0n;
    console.log(`  Wallet Balance: ${balance.toLocaleString()} tNight\n`);

    console.log("  Connecting to Midnight Contract...");
    const providers = await createProviders(walletCtx);

    const compiledContract = CompiledContract.make("confidential-dao", ConfidentialDao.Contract as any).pipe(
      CompiledContract.withWitnesses({}),
    );

    const deployed: any = await findDeployedContract(providers, {
      compiledContract: compiledContract as any,
      contractAddress: deployment.address,
      privateStateId: PRIVATE_STATE_ID,
      initialPrivateState: {},
    });

    console.log("  ✅ Connected to Confidential DAO contract!\n");

    let running = true;
    while (running) {
      console.log("─── Confidential Governance Menu ──────────────────────────────");
      console.log("  1. View Current Proposal & Public Ledger Tally");
      console.log("  2. Initialize New Proposal");
      console.log("  3. Cast Confidential ZK Ballot");
      console.log("  4. Finalize Proposal Voting");
      console.log("  5. Check Wallet Balance");
      console.log("  6. Exit\n");

      const choice = await rl.question("  Select option: ");

      switch (choice.trim()) {
        case "1": {
          console.log("\n  Querying ledger state from Midnight blockchain...");
          try {
            const contractState = await providers.publicDataProvider.queryContractState(deployment.address);
            if (contractState) {
              const ledger = ConfidentialDao.ledger(contractState.data);
              console.log("\n  ═════════════════════════════════════════════════════");
              console.log(`  Proposal ID:   #${ledger.proposalId}`);
              console.log(`  Title:         "${ledger.title || "Default Proposal"}"`);
              console.log(`  Status:        ${ledger.isFinalized ? "🔒 FINALIZED" : "🟢 ACTIVE"}`);
              console.log(`  Total Voters:  ${ledger.voterCount}`);
              console.log(`  YES Votes:     ${ledger.yesVotes}`);
              console.log(`  NO Votes:      ${ledger.noVotes}`);
              console.log("  ═════════════════════════════════════════════════════\n");
            } else {
              console.log("\n  📋 Contract state is currently empty.\n");
            }
          } catch (err) {
            console.error("\n  ❌ Query Error:", err instanceof Error ? err.message : err);
          }
          break;
        }

        case "2": {
          const title = await rl.question("  Enter Proposal Title: ");
          console.log("\n  Executing ZK circuit to create proposal...");
          try {
            const tx = await deployed.callTx.createProposal(title);
            console.log(`\n  ✅ Proposal Created!`);
            console.log(`  Tx ID: ${tx.public.txId}`);
            console.log(`  Block: ${tx.public.blockHeight}\n`);
          } catch (err) {
            console.error("\n  ❌ Creation Failed:", err instanceof Error ? err.message : err);
          }
          break;
        }

        case "3": {
          const choiceStr = await rl.question("  Vote YES or NO? (y/n): ");
          const isYes = choiceStr.trim().toLowerCase().startsWith("y");
          console.log(`\n  Generating ZK Proof for confidential ${isYes ? "YES" : "NO"} vote...`);
          try {
            const tx = await deployed.callTx.castVote(isYes);
            console.log(`\n  ✅ Confidential Vote Successfully Cast!`);
            console.log(`  Tx ID: ${tx.public.txId}`);
            console.log(`  Block: ${tx.public.blockHeight}\n`);
          } catch (err) {
            console.error("\n  ❌ Voting Failed:", err instanceof Error ? err.message : err);
          }
          break;
        }

        case "4": {
          console.log("\n  Finalizing proposal voting...");
          try {
            const tx = await deployed.callTx.finalizeProposal();
            console.log(`\n  ✅ Proposal Finalized!`);
            console.log(`  Tx ID: ${tx.public.txId}`);
            console.log(`  Block: ${tx.public.blockHeight}\n`);
          } catch (err) {
            console.error("\n  ❌ Finalize Failed:", err instanceof Error ? err.message : err);
          }
          break;
        }

        case "5": {
          console.log("\n  Checking balance...");
          const currentState = await walletCtx.wallet.waitForSyncedState();
          const currentBalance = currentState.unshielded.balances[unshieldedToken().raw] ?? 0n;
          const dustBalance = currentState.dust.balance(new Date());
          console.log(`\n  tNight: ${currentBalance.toLocaleString()}`);
          console.log(`  DUST:   ${dustBalance.toLocaleString()}\n`);
          break;
        }

        case "6":
          running = false;
          console.log("\n  👋 Goodbye!\n");
          break;

        default:
          console.log("\n  ❌ Invalid choice.\n");
      }
    }

    await persistWalletState(network, walletCtx);
    await walletCtx.wallet.stop();
  } catch (err) {
    console.error("\n❌ Error:", err instanceof Error ? err.message : err);
  } finally {
    rl.close();
  }
}

main().catch(console.error);
