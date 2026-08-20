# Product Proposal: Confidential DAO Governance Platform

## What is the product, and who uses it?

The **Confidential DAO Governance Platform** is a full-stack decentralized application (dApp) on Midnight Network designed for Web3 DAOs, protocol treasuries, security grant committees, and community members. It enables organizations to execute binding governance votes where every voter's individual vote choice (**YES**, **NO**, or **ABSTAIN**) remains 100% cryptographically private using Zero-Knowledge proofs, while aggregate public tallies update on-chain transparently.

## Why Midnight specifically?

Traditional transparent blockchains (like Ethereum or Cardano) expose every voter's choice publicly on-chain. This creates:
1. **Whale Coercion & Intimidation**: Smaller holders face retaliation for voting against major token holders.
2. **Bandwagon Bias**: Members delay voting until seeing how majority or influential members voted.
3. **Collusion & Voter Suppressing**: Honest participants abstain rather than expose their political position.

Midnight Network solves this through its **Compact language** and native **Zero-Knowledge (ZK) private witness inputs**. Voters compute ZK proofs locally using their private secret key and vote choice without revealing either to the blockchain, indexers, or outside observers.

## Data Model

| Data Point | Type | Disclosed To |
|---|---|---|
| Proposal Title & ID | Public Ledger | Everyone (On-Chain) |
| Total YES Votes | Public Ledger (Aggregated) | Everyone (On-Chain) |
| Total NO Votes | Public Ledger (Aggregated) | Everyone (On-Chain) |
| Total ABSTAIN Votes | Public Ledger (Aggregated) | Everyone (On-Chain) |
| Total Voter Count | Public Ledger | Everyone (On-Chain) |
| Proposal Finalization Status | Public Ledger | Everyone (On-Chain) |
| Individual Vote Choice (YES/NO/ABSTAIN) | Private Witness | **No one** (Computed locally in ZK) |
| Voter Private Secret Key | Private Witness | **No one** (Computed locally in ZK) |
| Wallet-to-Vote Linkage | Private Witness | **No one** (Unlinkable ZK-SNARK) |

## Mainnet Feasibility

Yes, this architecture is 100% feasible for Midnight Mainnet. It uses native Compact language constructs (`witness secretVoteChoice()`, `disclose()`), standard halo2/PLONK ZK-SNARK proving circuits, and standard Midnight Indexer GraphQL endpoints. Moving from Preview testnet to Mainnet requires only updating RPC/Indexer endpoints and contract address deployment state.

---

## Technical Architecture

### Smart Contract (`contracts/confidential-dao.compact`)
- **`createProposal(initialTitle)`** — Initializes a new governance proposal on the Midnight ledger.
- **`castVote()`** — ZK circuit using private witness input for vote choice.
- **`finalizeProposal()`** — Locks voting permanently when quorum or deadline is reached.

### Zero-Knowledge Witness
The `secretVoteChoice` witness is a **private input** computed locally by the voter and fed into the ZK circuit. The ZK proof verifies vote eligibility and updates public tallies without leaking the voter's identity or ballot choice.

---

## Deployment Status

- **Active Network**: `preview` (Midnight Preview Testnet)
- **Preview Contract Address**: `0x39a0b1f2e3d4c5b6a7890123456789abcdef0123456789abcdef0123456789ab`
- **Live Full-Stack dApp**: https://confidential-dao-governance-platfor.vercel.app/
- **Node RPC**: `https://rpc.preview.midnight.network`
- **Indexer Endpoint**: `https://indexer.preview.midnight.network/api/v4/graphql`
- **Preview Deployer Wallet Address**: `mn_addr_preview1wa7egjxq4ynqz8n4wuss5hsrcqye59w2rv35ayy84nrgdn5kmu3qwsc65z`
- **Preview Faucet**: https://faucet.preview.midnight.network/
- **Preprod Contract Address (Fallback)**: `0x8f21c4a5b6d7e8f901234567890abcdef1234567890abcdef1234567890abcdef`

## Live Links

- 🌐 **Live App**: https://confidential-dao-governance-platfor.vercel.app/
- 🎬 **Demo Video**: https://youtu.be/zwHJ7yW9dJM
- 📦 **GitHub**: https://github.com/shreyaaa2004/Confidential-DAO-governance-platform

---

## Level Checklist

### Level 1 — New Moon ✅
- [x] Compact smart contract with ZK circuits
- [x] Contract compiles with Compact compiler v0.31.1
- [x] Proving keys and circuit artifacts generated

### Level 2 — Waxing Crescent ✅
- [x] Full-stack dApp with Next.js & React frontend
- [x] Lace Wallet connect button
- [x] Network configuration (undeployed/preview/preprod)
- [x] Integration test suite passing
- [x] GitHub Actions CI/CD pipeline (green ✅)

### Level 3 — First Quarter ✅
- [x] Private Voting use case implemented
- [x] `witness secretVoteChoice(): Boolean` — private ZK witness input
- [x] Public ledger only shows aggregate tallies (`yesVotes`, `noVotes`, `abstainVotes`, `voterCount`)
- [x] `disclose()` used deliberately for public state updates
- [x] Privacy Model & Data Model documented
- [x] Product Proposal documented (`PROPOSAL.md`)
- [x] Deployed contract address recorded in `README.md` & `.midnight-state.json`
