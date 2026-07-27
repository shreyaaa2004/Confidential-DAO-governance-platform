# Product Proposal: Confidential DAO Governance Platform

## Problem Statement

Traditional Web3 DAOs expose every vote on-chain — anyone can see **who voted** and **what they voted**. This leads to:

- 🐋 **Whale influence**: Smaller holders change votes after seeing how large holders voted (bandwagon effect)
- 😨 **Voter intimidation**: Members fear retaliation for unpopular votes
- 🤝 **Collusion**: Voting blocs coordinate privately then vote publicly, disadvantaging honest participants
- 📉 **Low participation**: Members abstain rather than risk being seen voting against powerful members

## Solution

The **Confidential DAO Governance Platform** uses Midnight Network's **Zero-Knowledge proofs** to make individual vote choices cryptographically private while keeping aggregate results public and verifiable.

### How It Works

```
Voter provides: secret key + vote choice (YES/NO)
         ↓
ZK Circuit proves: "This voter is eligible and has cast a valid vote"
         ↓
On-chain result: Only the total YES/NO counter updates — no individual vote revealed
```

### Privacy Guarantees

| What is PUBLIC | What is PRIVATE |
|---|---|
| Total YES votes | Who voted YES |
| Total NO votes | Who voted NO |
| Proposal title | Individual vote identity linkage |
| Voter count | Private secret key of voter |
| Finalization status | Vote choice per wallet address |

## Category

**Private Voting** — Midnight Network Hackathon Level 3

## Technical Architecture

### Smart Contract (Compact Language)
- **`createProposal(title)`** — Initializes a new governance proposal
- **`castVote()`** — ZK circuit that uses private witness input for vote choice
- **`finalizeProposal()`** — Locks voting permanently

### Zero-Knowledge Witness
The `secretVoteChoice` witness is a **private input** — it is computed locally by the voter and fed into the ZK circuit. The circuit proves the vote is valid without revealing the choice to any observer, node, or indexer on the Midnight Network.

### Frontend (React + Vite)
- Lace Wallet integration for voter authentication
- Real-time YES/NO progress bars
- Proposal creation and governance admin UI
- Network config for Undeployed Devnet, Preview, and Preprod

### Infrastructure
- **Proof Server**: Local HTTP server for ZK proof generation
- **Indexer**: GraphQL endpoint for public ledger state
- **Node**: WebSocket connection to Midnight blockchain node

## Deployment Status

> **Preprod deployment: WAIVED**
> Per mentor guidance: *"If you're unable to deploy, just build the full-stack dApp and submit it."*
> Full-stack dApp is complete and live at: https://confidential-dao-governance-platfor.vercel.app/

## Live Links

- 🌐 **Live App**: https://confidential-dao-governance-platfor.vercel.app/
- 🎬 **Demo Video**: https://youtu.be/wEE7oRRMXZ4
- 📦 **GitHub**: https://github.com/shreyaaa2004/Confidential-DAO-governance-platform

## Level Checklist

### Level 1 — New Moon ✅
- [x] Compact smart contract with ZK circuits
- [x] Contract compiles with Compact compiler v0.31.1
- [x] Proving keys and circuit artifacts generated

### Level 2 — Waxing Crescent ✅
- [x] Full-stack dApp with React frontend
- [x] Lace Wallet connect button
- [x] Network configuration (undeployed/preview/preprod)
- [x] 4/4 integration tests passing
- [x] GitHub Actions CI/CD pipeline (green ✅)

### Level 3 — First Quarter ✅
- [x] Private Voting use case implemented
- [x] `witness secretVoteChoice(): Boolean` — private ZK witness input
- [x] Public ledger only shows aggregate tallies (yesVotes, noVotes, voterCount)
- [x] `disclose()` used deliberately for public state updates
- [x] Privacy Model documented
- [x] Product Proposal documented (this file)
- [x] Preprod deployment: **WAIVED** (per mentor guidance)
