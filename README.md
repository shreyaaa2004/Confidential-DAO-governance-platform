# Confidential DAO Governance Platform 🛡️

A full-stack Midnight dApp implementing **Private Voting** for confidential DAO governance on the Midnight Network using Zero-Knowledge proofs.

## 🎬 Demo Video

[![Watch Demo](https://img.shields.io/badge/▶%20Watch%20Demo-YouTube-red?style=for-the-badge&logo=youtube)](https://youtu.be/wEE7oRRMXZ4)

👉 **[https://youtu.be/wEE7oRRMXZ4](https://youtu.be/wEE7oRRMXZ4)**


## 📌 Product Proposal & Level 3 Category: Private Voting

The **Confidential DAO Governance Platform** solves the public voting dilemma in traditional Web3 DAOs (where voter identities and individual ballot choices are exposed on-chain, leading to voter intimidation, whale collusion, and bandwagon bias).

Using Midnight's Compact smart contract language:
- **Private Witness Inputs**: Voters provide their secret key and vote choice (`true` for YES, `false` for NO) locally.
- **Zero-Knowledge Circuits**: A ZK proof is computed by the Compact circuit (`castVote`) and verified on-chain.
- **Public Ledger State**: Only aggregated public vote counters (`yesVotes`, `noVotes`, `voterCount`) are updated via deliberate `disclose()`.

---

## 🔒 Privacy Model

### What Observers Can Learn:
1. Current active Proposal ID and Proposal Title.
2. Aggregated YES/NO vote tallies and total ballot count.
3. Proposal status (`isFinalized`).

### What Observers CANNOT Learn:
1. The individual vote choice (YES vs NO) cast by any single voter.
2. The voter's private secret key or witness payload.
3. Individual voter ballot linkage to on-chain identity.

### Deliberate Disclosures:
- `disclose(initialTitle)`: Public proposal title when created.
- `disclose(voteChoice)`: Disclosed inside ZK circuit logic exclusively to increment the public `yesVotes` or `noVotes` counter without linking to voter key.

---

## 🚀 Quick Start & Setup Guide

### 1. Prerequisites System Check
- **OS**: WSL Ubuntu Linux 6.18
- **Node.js**: v22.23.1 (`Node 22+` required)
- **npm**: 10.9.8
- **Docker & Compose**: Docker 29.6.2 (Proof server on port 6300, Node on port 9944, Indexer on port 8088)
- **Compact Compiler**: v0.5.1 with compiler `0.31.1` (`/home/shreya/.local/bin/compact`)

### 2. Installation & Contract Compilation
```bash
# Clone & Navigate
cd ~/midnight-projects/confidential-dao

# Install dependencies
npm install

# Compile Compact contract
npm run compile
```

### 3. Run Devnet & Local Deployment
```bash
# Start Docker services & deploy contract locally
npm run setup -- --network undeployed

# Launch Interactive CLI
npm run cli
```

### 4. Run Test Suite & Build Frontend
```bash
# Run automated contract test suite
npm test

# Build production web frontend
cd frontend
npm install
npm run build
```

---

## 🌐 Preprod Deployment Status & Mentor Guidance

| Network | Status | Notes |
|---------|--------|-------|
| `undeployed` | 🟢 OPERATIONAL | Full-stack local devnet verified on Docker + Proof Server (6300) |
| `preview` | 🟡 CONFIGURABLE | Endpoint configured at `rpc.preview.midnight.network` |
| `preprod` | 🟡 BLOCKED / WAIVED | Preprod faucet/wallet sync is currently blocked by indexer response timeouts. Following official hackathon mentor guidance ("If unable to deploy, build full-stack dApp and submit, skipping deployment"), Preprod address is documented as WAIVED while full-stack local dApp is 100% complete and verified. |

---

## ✅ Submission Checklist

### Level 1 Checklist
- [x] Compact contract created (`contracts/confidential-dao.compact`)
- [x] Public ledger state vs private witness clearly separated
- [x] Deliberate `disclose()` usage for public counters
- [x] Contract compiles via `compact compile` with managed circuits & keys generated
- [x] Local setup & deployment script (`npm run setup -- --network undeployed`)
- [x] Interactive CLI tool (`npm run cli`)
- [x] README documentation & minimum 5 meaningful commits

### Level 2 Checklist
- [x] Vite React frontend application created (`frontend/`)
- [x] Lace Wallet connect / disconnect UI integration
- [x] Contract integration loading address and network from env
- [x] Main circuit interaction (`castVote`, `createProposal`, `finalizeProposal`)
- [x] Public ledger state visualization (YES/NO progress bars, voter count)
- [x] Environment example (`.env.example`) created
- [x] Minimum 8 meaningful commits

### Level 3 Checklist
- [x] Production polish & responsive glassmorphism dark-mode UI
- [x] Automated test suite (`tests/dao-contract.test.ts`) with 4 passing tests
- [x] GitHub Actions CI workflow (`.github/workflows/ci.yml`)
- [x] Complete Privacy Model documentation (observers learn vs cannot learn)
- [x] Product Proposal section (Confidential DAO / Private Voting)
- [x] Clean build verification (`npm run build`)
- [x] Minimum 10 meaningful commits
