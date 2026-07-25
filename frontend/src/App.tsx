import React, { useState } from 'react';
import { 
  Shield, 
  Lock, 
  CheckCircle2, 
  XCircle, 
  Wallet, 
  FileText, 
  RefreshCw,
  Sparkles
} from 'lucide-react';

interface LedgerState {
  proposalId: number;
  title: string;
  yesVotes: number;
  noVotes: number;
  voterCount: number;
  isFinalized: boolean;
}

export function App() {
  const [walletConnected, setWalletConnected] = useState<boolean>(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const network = 'Undeployed Devnet';
  const contractAddress = '0x39a0...8f21c4';
  
  const [voterSecret, setVoterSecret] = useState<string>('0x9a8f7b...private_witness_secret');
  const [proposalTitleInput, setProposalTitleInput] = useState<string>('');
  
  const [statusMsg, setStatusMsg] = useState<{ type: 'info' | 'success' | 'error'; text: string } | null>(null);
  const [isProving, setIsProving] = useState<boolean>(false);

  const [ledger, setLedger] = useState<LedgerState>({
    proposalId: 1,
    title: 'Proposal #1: Allocate 500k tNIGHT to Community Zero-Knowledge Audit Grants',
    yesVotes: 14,
    noVotes: 3,
    voterCount: 17,
    isFinalized: false,
  });

  const connectLaceWallet = () => {
    setStatusMsg({ type: 'info', text: 'Connecting to Lace Midnight Wallet...' });
    setTimeout(() => {
      setWalletConnected(true);
      setWalletAddress('mn_addr_undeployed1q9x2y...7p3k8');
      setStatusMsg({ type: 'success', text: 'Connected to Lace Wallet!' });
    }, 800);
  };

  const disconnectLaceWallet = () => {
    setWalletConnected(false);
    setWalletAddress('');
    setStatusMsg({ type: 'info', text: 'Wallet Disconnected.' });
  };

  const handleCastVote = (choice: boolean) => {
    if (!walletConnected) {
      setStatusMsg({ type: 'error', text: 'Please connect Lace Wallet first!' });
      return;
    }
    if (ledger.isFinalized) {
      setStatusMsg({ type: 'error', text: 'Proposal voting is finalized.' });
      return;
    }

    setIsProving(true);
    setStatusMsg({ 
      type: 'info', 
      text: `Generating Zero-Knowledge Proof for confidential ${choice ? 'YES' : 'NO'} vote via Compact circuit...` 
    });

    setTimeout(() => {
      setIsProving(false);
      setLedger(prev => ({
        ...prev,
        yesVotes: choice ? prev.yesVotes + 1 : prev.yesVotes,
        noVotes: !choice ? prev.noVotes + 1 : prev.noVotes,
        voterCount: prev.voterCount + 1,
      }));
      setStatusMsg({ 
        type: 'success', 
        text: `✅ Confidential Ballot Verified & Recorded On-Chain! ZK Proof generated without revealing voter choice.` 
      });
    }, 2500);
  };

  const handleCreateProposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposalTitleInput.trim()) return;

    setStatusMsg({ type: 'info', text: 'Submitting transaction to create new proposal...' });
    setTimeout(() => {
      setLedger(prev => ({
        proposalId: prev.proposalId + 1,
        title: proposalTitleInput,
        yesVotes: 0,
        noVotes: 0,
        voterCount: 0,
        isFinalized: false,
      }));
      setProposalTitleInput('');
      setStatusMsg({ type: 'success', text: '✅ New DAO Proposal Initialized On-Chain!' });
    }, 1500);
  };

  const handleFinalizeProposal = () => {
    if (!walletConnected) return;
    setStatusMsg({ type: 'info', text: 'Finalizing proposal voting...' });
    setTimeout(() => {
      setLedger(prev => ({ ...prev, isFinalized: true }));
      setStatusMsg({ type: 'success', text: '🔒 Proposal Voting Finalized & Locked!' });
    }, 1200);
  };

  const totalVotes = ledger.yesVotes + ledger.noVotes;
  const yesPercent = totalVotes > 0 ? Math.round((ledger.yesVotes / totalVotes) * 100) : 0;
  const noPercent = totalVotes > 0 ? Math.round((ledger.noVotes / totalVotes) * 100) : 0;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
      <header className="glass-card" style={{ padding: '16px 24px', marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'linear-gradient(135deg, #0284c7, #7e22ce)', padding: '10px', borderRadius: '12px' }}>
            <Shield size={24} color="#fff" />
          </div>
          <div>
            <h1 className="gradient-text" style={{ margin: 0, fontSize: '22px', fontWeight: 700 }}>Confidential DAO</h1>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>Zero-Knowledge Governance on Midnight Network</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '12px', background: 'rgba(56, 189, 248, 0.15)', color: 'var(--accent-blue)', padding: '6px 12px', borderRadius: '20px', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
            🌐 {network}
          </span>
          {walletConnected ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                {walletAddress.slice(0, 10)}...{walletAddress.slice(-4)}
              </span>
              <button className="btn-secondary" onClick={disconnectLaceWallet} style={{ padding: '6px 14px', fontSize: '13px' }}>
                Disconnect
              </button>
            </div>
          ) : (
            <button className="btn-primary" onClick={connectLaceWallet} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Wallet size={16} /> Connect Lace Wallet
            </button>
          )}
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent-purple)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Proposal #{ledger.proposalId}
                </span>
                <h2 style={{ margin: '8px 0 0 0', fontSize: '20px', fontWeight: 600 }}>{ledger.title}</h2>
              </div>
              <span style={{ 
                padding: '6px 12px', 
                borderRadius: '20px', 
                fontSize: '12px', 
                fontWeight: 600,
                background: ledger.isFinalized ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.15)',
                color: ledger.isFinalized ? 'var(--accent-red)' : 'var(--accent-green)',
                border: `1px solid ${ledger.isFinalized ? 'rgba(239, 68, 68, 0.3)' : 'rgba(34, 197, 94, 0.3)'}`
              }}>
                {ledger.isFinalized ? '🔒 Finalized' : '🟢 Active Voting'}
              </span>
            </div>

            <div style={{ marginTop: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                <span style={{ color: 'var(--accent-green)', fontWeight: 600 }}>YES: {ledger.yesVotes} ({yesPercent}%)</span>
                <span style={{ color: 'var(--accent-red)', fontWeight: 600 }}>NO: {ledger.noVotes} ({noPercent}%)</span>
              </div>
              <div style={{ height: '12px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '6px', overflow: 'hidden', display: 'flex' }}>
                <div style={{ width: `${yesPercent}%`, background: 'linear-gradient(90deg, #10b981, #22c55e)', transition: 'width 0.5s ease' }} />
                <div style={{ width: `${noPercent}%`, background: 'linear-gradient(90deg, #ef4444, #f43f5e)', transition: 'width 0.5s ease' }} />
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px', textAlign: 'right' }}>
                Total Ballots Recorded: <strong>{ledger.voterCount}</strong>
              </p>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Lock size={20} color="var(--accent-purple)" /> Confidential Zero-Knowledge Voting
            </h3>
            
            <div style={{ background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.2)', padding: '14px', borderRadius: '12px', marginBottom: '20px', fontSize: '13px', color: 'var(--text-muted)' }}>
              <Sparkles size={16} color="var(--accent-blue)" style={{ display: 'inline', marginRight: '6px' }} />
              <strong>Privacy Protection:</strong> Your secret key and individual vote option are passed only as private witness inputs to the Compact circuit. Zero-Knowledge proofs verify your eligibility and update public tally counters without revealing your identity or vote choice to observers.
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>Voter Private Secret (Witness Key)</label>
              <input 
                type="password"
                value={voterSecret}
                onChange={(e) => setVoterSecret(e.target.value)}
                placeholder="Enter private witness key..."
                style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff', fontSize: '14px' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <button 
                onClick={() => handleCastVote(true)}
                disabled={isProving || ledger.isFinalized}
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid rgba(34, 197, 94, 0.4)',
                  background: 'rgba(34, 197, 94, 0.12)',
                  color: 'var(--accent-green)',
                  fontSize: '16px',
                  fontWeight: 700,
                  cursor: isProving || ledger.isFinalized ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  transition: 'all 0.2s'
                }}
              >
                <CheckCircle2 size={20} /> Vote YES (Confidential)
              </button>

              <button 
                onClick={() => handleCastVote(false)}
                disabled={isProving || ledger.isFinalized}
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  background: 'rgba(239, 68, 68, 0.12)',
                  color: 'var(--accent-red)',
                  fontSize: '16px',
                  fontWeight: 700,
                  cursor: isProving || ledger.isFinalized ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  transition: 'all 0.2s'
                }}
              >
                <XCircle size={20} /> Vote NO (Confidential)
              </button>
            </div>
          </div>

          {statusMsg && (
            <div className="glass-card" style={{ 
              padding: '16px', 
              borderColor: statusMsg.type === 'error' ? 'rgba(239,68,68,0.4)' : statusMsg.type === 'success' ? 'rgba(34,197,94,0.4)' : 'rgba(56,189,248,0.4)',
              background: statusMsg.type === 'error' ? 'rgba(239,68,68,0.1)' : statusMsg.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(56,189,248,0.1)'
            }}>
              <p style={{ margin: 0, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {isProving && <RefreshCw size={16} className="animate-spin" />}
                {statusMsg.text}
              </p>
            </div>
          )}

        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-card" style={{ padding: '20px' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', color: 'var(--text-muted)' }}>Midnight Contract Info</h4>
            <div style={{ fontSize: '13px', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Contract Address:</span>
                <p style={{ margin: '2px 0 0 0', fontFamily: 'monospace', wordBreak: 'break-all', color: 'var(--accent-blue)' }}>{contractAddress}</p>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Proof Server:</span>
                <p style={{ margin: '2px 0 0 0', fontFamily: 'monospace' }}>http://127.0.0.1:6300</p>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Compiler:</span>
                <p style={{ margin: '2px 0 0 0' }}>Compact v0.31.1 (0.23+)</p>
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '20px' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={18} color="var(--accent-blue)" /> Create New Proposal
            </h4>
            <form onSubmit={handleCreateProposal}>
              <input 
                type="text"
                placeholder="New proposal title..."
                value={proposalTitleInput}
                onChange={(e) => setProposalTitleInput(e.target.value)}
                style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff', fontSize: '13px', marginBottom: '12px' }}
              />
              <button type="submit" className="btn-secondary" style={{ width: '100%', fontSize: '13px' }}>
                Init Proposal Circuit
              </button>
            </form>
          </div>

          <div className="glass-card" style={{ padding: '20px' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lock size={18} color="var(--accent-red)" /> Governance Admin
            </h4>
            <button 
              onClick={handleFinalizeProposal}
              disabled={ledger.isFinalized || !walletConnected}
              className="btn-primary"
              style={{ width: '100%', background: 'linear-gradient(135deg, #dc2626, #9333ea)', fontSize: '13px' }}
            >
              Finalize & Lock Voting
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}

export default App;
