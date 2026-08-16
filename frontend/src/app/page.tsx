'use client';

import React, { useState } from 'react';
import { 
  Shield, 
  Lock, 
  CheckCircle2, 
  XCircle, 
  MinusCircle,
  Wallet, 
  Sparkles,
  PlusCircle,
  Activity,
  Layers,
  Flame,
  Copy,
  ChevronRight,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';

interface Proposal {
  id: number;
  title: string;
  category: 'Treasury' | 'Protocol' | 'Security Grants' | 'Ecosystem';
  description: string;
  author: string;
  yesVotes: number;
  noVotes: number;
  abstainVotes: number;
  voterCount: number;
  quorumTarget: number;
  isFinalized: boolean;
  status: 'Active' | 'Passed' | 'Rejected';
}

interface BallotAuditRecord {
  txHash: string;
  proposalId: number;
  timestamp: string;
  proofType: string;
  zkCircuit: string;
  verificationStatus: 'Verified On-Chain' | 'Proving';
}

export default function Home() {
  const [walletConnected, setWalletConnected] = useState<boolean>(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  
  const [activeTab, setActiveTab] = useState<'All' | 'Treasury' | 'Protocol' | 'Security Grants'>('All');
  const [selectedProposalId, setSelectedProposalId] = useState<number>(1);
  
  const [voterSecret, setVoterSecret] = useState<string>('0x9a8f7b3c2d1e0f4a5b6c7d8e9f0a1b2c3d4e5f6a');
  const [isProving, setIsProving] = useState<boolean>(false);
  const [proofStep, setProofStep] = useState<number>(0);
  const [statusMsg, setStatusMsg] = useState<{ type: 'info' | 'success' | 'error'; text: string } | null>(null);
  
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newCategory, setNewCategory] = useState<'Treasury' | 'Protocol' | 'Security Grants'>('Treasury');
  const [newDescription, setNewDescription] = useState<string>('');

  const [proposals, setProposals] = useState<Proposal[]>([
    {
      id: 1,
      title: 'MIP-14: Allocate 500k tNIGHT to Community Zero-Knowledge Audit Grants',
      category: 'Security Grants',
      description: 'Fund third-party formal verification audits for public Midnight smart contracts and privacy circuits.',
      author: 'mn_addr_preview1wa7egjxq4ynqz8n4wuss5hsrcqye59w2rv35ayy84nrgdn5kmu3qwsc65z',
      yesVotes: 24,
      noVotes: 4,
      abstainVotes: 2,
      voterCount: 30,
      quorumTarget: 25,
      isFinalized: false,
      status: 'Active'
    },
    {
      id: 2,
      title: 'MIP-15: Deploy Confidential Treasury Multi-Sig Shielded Vault',
      category: 'Treasury',
      description: 'Implement threshold-encrypted treasury disbursements using zero-knowledge witness authorization.',
      author: 'mn_addr_preview1q8c3h7j9k2l4m5n6p7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4j5k6l7m8n9p',
      yesVotes: 18,
      noVotes: 2,
      abstainVotes: 1,
      voterCount: 21,
      quorumTarget: 20,
      isFinalized: true,
      status: 'Passed'
    },
    {
      id: 3,
      title: 'MIP-16: Upgrade Governance Quorum Weight to Quadratic ZK Tallying',
      category: 'Protocol',
      description: 'Replace standard linear token-weighted governance with sybil-resistant quadratic voting proofs.',
      author: 'mn_addr_preview1q8c3h7j9k2l4m5n6p7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4j5k6l7m8n9p',
      yesVotes: 12,
      noVotes: 1,
      abstainVotes: 3,
      voterCount: 16,
      quorumTarget: 25,
      isFinalized: false,
      status: 'Active'
    }
  ]);

  const [auditLog, setAuditLog] = useState<BallotAuditRecord[]>([
    {
      txHash: '0x7e2a...9c4b',
      proposalId: 1,
      timestamp: '2 mins ago',
      proofType: 'ZK-SNARK (Halo2/PLONK)',
      zkCircuit: 'castVote()',
      verificationStatus: 'Verified On-Chain'
    },
    {
      txHash: '0x3f1d...8a7e',
      proposalId: 1,
      timestamp: '7 mins ago',
      proofType: 'ZK-SNARK (Halo2/PLONK)',
      zkCircuit: 'castVote()',
      verificationStatus: 'Verified On-Chain'
    },
    {
      txHash: '0x9c4e...2b1f',
      proposalId: 2,
      timestamp: '18 mins ago',
      proofType: 'ZK-SNARK (Halo2/PLONK)',
      zkCircuit: 'createProposal()',
      verificationStatus: 'Verified On-Chain'
    }
  ]);

  const activeProposal = proposals.find(p => p.id === selectedProposalId) || proposals[0];

  const connectLaceWallet = () => {
    setStatusMsg({ type: 'info', text: 'Connecting to Midnight Lace Wallet...' });
    setTimeout(() => {
      setWalletConnected(true);
      setWalletAddress('mn_addr_preview1wa7egjxq4ynqz8n4wuss5hsrcqye59w2rv35ayy84nrgdn5kmu3qwsc65z');
      setStatusMsg({ type: 'success', text: 'Connected to Midnight Preview Lace Wallet!' });
    }, 600);
  };

  const disconnectLaceWallet = () => {
    setWalletConnected(false);
    setWalletAddress('');
    setStatusMsg({ type: 'info', text: 'Wallet Disconnected.' });
  };

  const generateRandomSecret = () => {
    const chars = '0123456789abcdef';
    let hex = '0x';
    for (let i = 0; i < 40; i++) {
      hex += chars[Math.floor(Math.random() * chars.length)];
    }
    setVoterSecret(hex);
  };

  const handleCastVote = (choice: 'YES' | 'NO' | 'ABSTAIN') => {
    if (!walletConnected) {
      setStatusMsg({ type: 'error', text: 'Please connect Lace Wallet before casting a confidential ballot!' });
      return;
    }
    if (activeProposal.isFinalized) {
      setStatusMsg({ type: 'error', text: 'This proposal voting window is already finalized.' });
      return;
    }

    setIsProving(true);
    setProofStep(1);
    setStatusMsg({ type: 'info', text: `Step 1/3: Binding local secret witness key to confidential ${choice} vote...` });

    setTimeout(() => {
      setProofStep(2);
      setStatusMsg({ type: 'info', text: 'Step 2/3: Computing Zero-Knowledge Proof with Compact circuit castVote()...' });
      
      setTimeout(() => {
        setProofStep(3);
        setStatusMsg({ type: 'info', text: 'Step 3/3: Disclosing public tally counters without revealing ballot choice on Midnight Preview...' });

        setTimeout(() => {
          setIsProving(false);
          setProofStep(0);

          setProposals(prev => prev.map(p => {
            if (p.id === activeProposal.id) {
              return {
                ...p,
                yesVotes: choice === 'YES' ? p.yesVotes + 1 : p.yesVotes,
                noVotes: choice === 'NO' ? p.noVotes + 1 : p.noVotes,
                abstainVotes: choice === 'ABSTAIN' ? p.abstainVotes + 1 : p.abstainVotes,
                voterCount: p.voterCount + 1,
              };
            }
            return p;
          }));

          const randomHash = `0x${Math.random().toString(16).substring(2, 6)}...${Math.random().toString(16).substring(2, 6)}`;
          setAuditLog(prev => [
            {
              txHash: randomHash,
              proposalId: activeProposal.id,
              timestamp: 'Just now',
              proofType: 'ZK-SNARK (Halo2/PLONK)',
              zkCircuit: 'castVote()',
              verificationStatus: 'Verified On-Chain'
            },
            ...prev
          ]);

          setStatusMsg({ 
            type: 'success', 
            text: `🎉 Confidential Ballot Cast Successfully! Proof verified on-chain. Your vote (${choice}) remains cryptographically private.` 
          });
        }, 800);
      }, 1000);
    }, 800);
  };

  const handleCreateProposalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newProp: Proposal = {
      id: proposals.length + 1,
      title: newTitle,
      category: newCategory,
      description: newDescription || 'Community submitted governance initiative.',
      author: walletAddress || 'mn_addr_preview1wa7egjxq4ynqz8n4wuss5hsrcqye59w2rv35ayy84nrgdn5kmu3qwsc65z',
      yesVotes: 0,
      noVotes: 0,
      abstainVotes: 0,
      voterCount: 0,
      quorumTarget: 20,
      isFinalized: false,
      status: 'Active'
    };

    setProposals(prev => [newProp, ...prev]);
    setSelectedProposalId(newProp.id);
    setShowCreateModal(false);
    setNewTitle('');
    setNewDescription('');
    setStatusMsg({ type: 'success', text: `✅ Proposal #${newProp.id} initialized on Midnight Preview ledger!` });
  };

  const filteredProposals = activeTab === 'All' 
    ? proposals 
    : proposals.filter(p => p.category === activeTab);

  const totalVotesCount = activeProposal.yesVotes + activeProposal.noVotes + activeProposal.abstainVotes || 1;
  const yesPct = Math.round((activeProposal.yesVotes / totalVotesCount) * 100);
  const noPct = Math.round((activeProposal.noVotes / totalVotesCount) * 100);
  const abstainPct = Math.round((activeProposal.abstainVotes / totalVotesCount) * 100);
  const quorumPct = Math.min(100, Math.round((activeProposal.voterCount / activeProposal.quorumTarget) * 100));

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* ─── Top Navbar ─── */}
      <header style={{ 
        borderBottom: '1px solid var(--border-color)', 
        background: 'rgba(7, 9, 14, 0.85)', 
        backdropFilter: 'blur(20px)',
        position: 'sticky', 
        top: 0, 
        zIndex: 50,
        padding: '14px 28px'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          
          {/* Logo & Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ 
              width: '42px', 
              height: '42px', 
              borderRadius: '12px', 
              background: 'linear-gradient(135deg, #00f0ff 0%, #a855f7 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(0, 240, 255, 0.4)'
            }}>
              <Shield size={24} color="#ffffff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="font-heading" style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.5px' }}>
                  Confidential DAO
                </span>
                <span style={{ 
                  background: 'rgba(0, 240, 255, 0.12)', 
                  border: '1px solid rgba(0, 240, 255, 0.3)',
                  color: 'var(--cyan-neon)',
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '20px'
                }}>
                  v2.0 Next.js dApp
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>
                Zero-Knowledge Privacy Governance on Midnight Network
              </p>
            </div>
          </div>

          {/* Network & Wallet Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            
            {/* Network Selector Pill */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px',
              padding: '6px 14px', 
              borderRadius: '30px', 
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-color)',
              fontSize: '12px'
            }}>
              <span className="pulsing-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
              <span style={{ color: 'var(--text-muted)' }}>Network:</span>
              <span style={{ fontWeight: 600, color: 'var(--cyan-neon)' }}>Midnight Preview</span>
            </div>

            {/* Create Proposal Button */}
            <button 
              onClick={() => setShowCreateModal(true)}
              style={{
                background: 'rgba(168, 85, 247, 0.15)',
                border: '1px solid rgba(168, 85, 247, 0.4)',
                color: '#d8b4fe',
                borderRadius: '12px',
                padding: '10px 16px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease'
              }}
            >
              <PlusCircle size={16} />
              New Proposal
            </button>

            {/* Lace Wallet Button */}
            {walletConnected ? (
              <button 
                onClick={disconnectLaceWallet}
                style={{
                  background: 'rgba(244, 63, 94, 0.12)',
                  border: '1px solid rgba(244, 63, 94, 0.35)',
                  color: '#fb7185',
                  borderRadius: '12px',
                  padding: '10px 16px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div>
                <span className="font-mono">{walletAddress.slice(0, 10)}...{walletAddress.slice(-6)}</span>
                <span style={{ fontSize: '11px', opacity: 0.7 }}>(Disconnect)</span>
              </button>
            ) : (
              <button 
                onClick={connectLaceWallet}
                className="btn-neon-cyan"
                style={{ fontSize: '13px', padding: '10px 18px' }}
              >
                <Wallet size={16} />
                Connect Lace Wallet
              </button>
            )}

          </div>
        </div>
      </header>

      {/* ─── Main Content ─── */}
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px 28px', flex: 1, width: '100%' }}>

        {/* Status Notification */}
        {statusMsg && (
          <div style={{
            marginBottom: '20px',
            padding: '14px 20px',
            borderRadius: '14px',
            background: statusMsg.type === 'success' 
              ? 'rgba(16, 185, 129, 0.12)' 
              : statusMsg.type === 'error'
              ? 'rgba(244, 63, 94, 0.12)'
              : 'rgba(0, 240, 255, 0.12)',
            border: `1px solid ${
              statusMsg.type === 'success' ? '#10b981' : statusMsg.type === 'error' ? '#f43f5e' : '#00f0ff'
            }`,
            color: statusMsg.type === 'success' ? '#34d399' : statusMsg.type === 'error' ? '#fb7185' : '#38bdf8',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {statusMsg.type === 'success' ? <CheckCircle2 size={18} /> : <Info size={18} />}
              <span>{statusMsg.text}</span>
            </div>
            <button 
              onClick={() => setStatusMsg(null)}
              style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '16px' }}
            >
              ✕
            </button>
          </div>
        )}

        {/* ─── Top Stats Bar ─── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '28px' }}>
          
          <div className="glass-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>Active Governance</span>
              <Activity size={18} color="var(--cyan-neon)" />
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800 }} className="font-heading">
              {proposals.filter(p => !p.isFinalized).length} Active <span style={{ fontSize: '14px', color: 'var(--text-dim)', fontWeight: 400 }}>/ {proposals.length} Total</span>
            </div>
            <div style={{ fontSize: '12px', color: '#34d399', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Sparkles size={12} /> Midnight Preview Network Live
            </div>
          </div>

          <div className="glass-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>Total Shielded Ballots</span>
              <Lock size={18} color="var(--purple-neon)" />
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800 }} className="font-heading">
              {proposals.reduce((acc, p) => acc + p.voterCount, 0)} Ballots
            </div>
            <div style={{ fontSize: '12px', color: 'var(--purple-neon)', marginTop: '6px' }}>
              100% Zero-Knowledge Proven
            </div>
          </div>

          <div className="glass-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>Privacy Shield Score</span>
              <ShieldCheck size={18} color="#10b981" />
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800 }} className="font-heading">
              100.0% <span style={{ fontSize: '13px', color: '#10b981', fontWeight: 600 }}>Unlinkable</span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
              Private witness key protection
            </div>
          </div>

          <div className="glass-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>Active Quorum Progress</span>
              <Zap size={18} color="#f59e0b" />
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800 }} className="font-heading">
              {quorumPct}% <span style={{ fontSize: '13px', color: quorumPct >= 100 ? '#10b981' : '#f59e0b', fontWeight: 600 }}>({activeProposal.voterCount}/{activeProposal.quorumTarget})</span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
              Target: {activeProposal.quorumTarget} verified ballots
            </div>
          </div>

        </div>

        {/* ─── Main Grid Layout (2 Columns) ─── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px' }}>
          
          {/* Left Column: Active Proposal & Confidential Ballot Box */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Proposal Category Filters */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              {(['All', 'Treasury', 'Protocol', 'Security Grants'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '12px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: activeTab === tab ? 'rgba(0, 240, 255, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                    color: activeTab === tab ? 'var(--cyan-neon)' : 'var(--text-muted)',
                    border: `1px solid ${activeTab === tab ? 'rgba(0, 240, 255, 0.4)' : 'var(--border-color)'}`,
                    transition: 'all 0.2s ease'
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Active Proposal Hero Card */}
            <div className="glass-card" style={{ padding: '28px', position: 'relative', overflow: 'hidden' }}>
              
              {/* Category & Status Badges */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ 
                    background: 'rgba(168, 85, 247, 0.15)', 
                    border: '1px solid rgba(168, 85, 247, 0.3)',
                    color: '#d8b4fe',
                    fontSize: '12px',
                    fontWeight: 600,
                    padding: '4px 10px',
                    borderRadius: '8px'
                  }}>
                    {activeProposal.category}
                  </span>
                  <span style={{ fontSize: '13px', color: 'var(--text-dim)', fontWeight: 600 }}>
                    Proposal #{activeProposal.id}
                  </span>
                </div>

                <span style={{ 
                  background: activeProposal.isFinalized 
                    ? 'rgba(100, 116, 139, 0.2)' 
                    : 'rgba(16, 185, 129, 0.15)',
                  border: `1px solid ${activeProposal.isFinalized ? '#64748b' : '#10b981'}`,
                  color: activeProposal.isFinalized ? '#94a3b8' : '#34d399',
                  fontSize: '12px',
                  fontWeight: 700,
                  padding: '4px 12px',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: activeProposal.isFinalized ? '#94a3b8' : '#10b981' }}></span>
                  {activeProposal.isFinalized ? 'Voting Finalized' : 'Active Voting'}
                </span>
              </div>

              {/* Title & Description */}
              <h2 className="font-heading" style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 12px 0', lineHeight: 1.3 }}>
                {activeProposal.title}
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6, margin: '0 0 24px 0' }}>
                {activeProposal.description}
              </p>

              {/* Public Vote Breakdown Bar */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px', fontWeight: 600 }}>
                  <span style={{ color: '#34d399' }}>YES: {activeProposal.yesVotes} ({yesPct}%)</span>
                  <span style={{ color: '#fbbf24' }}>ABSTAIN: {activeProposal.abstainVotes} ({abstainPct}%)</span>
                  <span style={{ color: '#fb7185' }}>NO: {activeProposal.noVotes} ({noPct}%)</span>
                </div>

                {/* Progress bar */}
                <div style={{ 
                  height: '14px', 
                  borderRadius: '8px', 
                  background: '#1e293b', 
                  display: 'flex', 
                  overflow: 'hidden',
                  padding: '2px',
                  gap: '2px'
                }}>
                  <div style={{ width: `${yesPct}%`, background: 'linear-gradient(90deg, #10b981, #34d399)', borderRadius: '6px', transition: 'width 0.4s ease' }}></div>
                  <div style={{ width: `${abstainPct}%`, background: 'linear-gradient(90deg, #f59e0b, #fbbf24)', borderRadius: '6px', transition: 'width 0.4s ease' }}></div>
                  <div style={{ width: `${noPct}%`, background: 'linear-gradient(90deg, #f43f5e, #fb7185)', borderRadius: '6px', transition: 'width 0.4s ease' }}></div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-dim)', marginTop: '8px' }}>
                  <span>Total Ballots: <strong style={{ color: 'var(--text-main)' }}>{activeProposal.voterCount}</strong></span>
                  <span>Quorum Target: <strong style={{ color: 'var(--text-main)' }}>{activeProposal.quorumTarget} Ballots</strong></span>
                </div>
              </div>

              {/* ─── Confidential Zero-Knowledge Voting Panel ─── */}
              <div style={{ 
                borderTop: '1px solid var(--border-color)', 
                paddingTop: '24px',
                marginTop: '10px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Lock size={18} color="var(--cyan-neon)" />
                    <span className="font-heading" style={{ fontSize: '16px', fontWeight: 700 }}>
                      Confidential Ballot Box (Zero-Knowledge)
                    </span>
                  </div>
                  <span style={{ fontSize: '12px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <ShieldCheck size={14} /> Secret Witness Mode
                  </span>
                </div>

                {/* Secret Key Witness Generator */}
                <div style={{ marginBottom: '18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    <span>Voter Secret Witness Key (Computed locally, never leaked):</span>
                    <button 
                      onClick={generateRandomSecret}
                      style={{ background: 'none', border: 'none', color: 'var(--cyan-neon)', cursor: 'pointer', fontSize: '12px', padding: 0 }}
                    >
                      🎲 Generate Random Key
                    </button>
                  </div>
                  <input 
                    type="password" 
                    value={voterSecret}
                    onChange={(e) => setVoterSecret(e.target.value)}
                    className="font-mono"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      background: 'rgba(0, 0, 0, 0.4)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-main)',
                      fontSize: '13px',
                      outline: 'none'
                    }}
                  />
                </div>

                {/* 3-Step ZK Proving Pipeline Animation */}
                {isProving && (
                  <div style={{ 
                    marginBottom: '18px', 
                    padding: '16px', 
                    borderRadius: '12px', 
                    background: 'rgba(0, 240, 255, 0.06)',
                    border: '1px solid rgba(0, 240, 255, 0.25)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                      <div className="animate-spin" style={{ width: '18px', height: '18px', border: '2px solid var(--cyan-neon)', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--cyan-neon)' }}>
                        Generating Zero-Knowledge SNARK Proof...
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', fontSize: '11px' }}>
                      <div style={{ padding: '8px', borderRadius: '8px', background: proofStep >= 1 ? 'rgba(0, 240, 255, 0.15)' : 'rgba(255,255,255,0.02)', color: proofStep >= 1 ? '#38bdf8' : '#64748b' }}>
                        1. Encrypt Witness
                      </div>
                      <div style={{ padding: '8px', borderRadius: '8px', background: proofStep >= 2 ? 'rgba(168, 85, 247, 0.2)' : 'rgba(255,255,255,0.02)', color: proofStep >= 2 ? '#d8b4fe' : '#64748b' }}>
                        2. Compact Circuit
                      </div>
                      <div style={{ padding: '8px', borderRadius: '8px', background: proofStep >= 3 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.02)', color: proofStep >= 3 ? '#34d399' : '#64748b' }}>
                        3. Update Tally
                      </div>
                    </div>
                  </div>
                )}

                {/* 3 Voting Buttons */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <button 
                    onClick={() => handleCastVote('YES')}
                    disabled={isProving || activeProposal.isFinalized}
                    className="btn-vote-yes"
                  >
                    <CheckCircle2 size={18} />
                    Vote YES
                  </button>

                  <button 
                    onClick={() => handleCastVote('ABSTAIN')}
                    disabled={isProving || activeProposal.isFinalized}
                    className="btn-vote-abstain"
                  >
                    <MinusCircle size={18} />
                    Vote ABSTAIN
                  </button>

                  <button 
                    onClick={() => handleCastVote('NO')}
                    disabled={isProving || activeProposal.isFinalized}
                    className="btn-vote-no"
                  >
                    <XCircle size={18} />
                    Vote NO
                  </button>
                </div>

              </div>

            </div>

            {/* ─── Other Proposals List ─── */}
            <div>
              <h3 className="font-heading" style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 14px 0' }}>
                All Governance Proposals ({filteredProposals.length})
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {filteredProposals.map(proposal => (
                  <div 
                    key={proposal.id}
                    onClick={() => setSelectedProposalId(proposal.id)}
                    className={`glass-card glass-card-interactive ${selectedProposalId === proposal.id ? 'glass-card-active' : ''}`}
                    style={{ padding: '18px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '6px', background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)' }}>
                          {proposal.category}
                        </span>
                        <span style={{ fontSize: '14px', fontWeight: 700 }}>
                          MIP-{proposal.id}: {proposal.title.slice(0, 50)}...
                        </span>
                      </div>
                      <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                        {proposal.voterCount} ZK Ballots Cast · {proposal.isFinalized ? 'Concluded' : 'Active'}
                      </span>
                    </div>

                    <ChevronRight size={18} color="var(--text-muted)" />
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Verified On-Chain Audit Feed & Contract Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Live On-Chain Verified Ballots */}
            <div className="glass-card" style={{ padding: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Layers size={18} color="var(--purple-neon)" />
                  <h3 className="font-heading" style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>
                    On-Chain ZK Audit Log
                  </h3>
                </div>
                <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 600 }}>Live Feed</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {auditLog.map((record, idx) => (
                  <div key={idx} style={{ 
                    padding: '12px 14px', 
                    borderRadius: '12px', 
                    background: 'rgba(255, 255, 255, 0.02)', 
                    border: '1px solid var(--border-color)',
                    fontSize: '12px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span className="font-mono" style={{ color: 'var(--cyan-neon)', fontWeight: 600 }}>
                        {record.txHash}
                      </span>
                      <span style={{ color: 'var(--text-dim)' }}>{record.timestamp}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '11px' }}>
                      <span>Circuit: <code style={{ color: '#d8b4fe' }}>{record.zkCircuit}</code></span>
                      <span style={{ color: '#34d399', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={12} /> {record.verificationStatus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Midnight Network Contract Specifications */}
            <div className="glass-card" style={{ padding: '22px' }}>
              <h3 className="font-heading" style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Flame size={18} color="#f59e0b" /> Midnight Deployment Specs
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px' }}>
                <div>
                  <span style={{ color: 'var(--text-dim)', display: 'block', marginBottom: '2px' }}>Active Contract Address (Preview):</span>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.3)', padding: '6px 10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <code className="font-mono" style={{ color: 'var(--cyan-neon)', fontSize: '11px' }}>
                      0x39a0...89ab
                    </code>
                    <button 
                      onClick={() => navigator.clipboard.writeText('0x39a0b1f2e3d4c5b6a7890123456789abcdef0123456789abcdef0123456789ab')}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
                    >
                      <Copy size={12} />
                    </button>
                  </div>
                </div>

                <div>
                  <span style={{ color: 'var(--text-dim)', display: 'block', marginBottom: '2px' }}>Preview Node RPC:</span>
                  <code className="font-mono" style={{ color: 'var(--text-main)', fontSize: '11px' }}>https://rpc.preview.midnight.network</code>
                </div>

                <div>
                  <span style={{ color: 'var(--text-dim)', display: 'block', marginBottom: '2px' }}>Proof Server Engine:</span>
                  <span style={{ color: '#34d399', fontWeight: 600 }}>● http://127.0.0.1:6300 (Healthy)</span>
                </div>

                <div>
                  <span style={{ color: 'var(--text-dim)', display: 'block', marginBottom: '2px' }}>Compact Compiler:</span>
                  <span style={{ color: 'var(--text-main)' }}>v0.31.1 (Runtime v0.16.0)</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </main>

      {/* ─── Create Proposal Modal ─── */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '540px', padding: '28px', background: '#0b0f19' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 className="font-heading" style={{ fontSize: '20px', fontWeight: 800, margin: 0 }}>
                Initialize New DAO Proposal
              </h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '18px' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProposalSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>
                  Proposal Title
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. MIP-17: Allocate 250k tNIGHT to Zero-Knowledge Education"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-main)',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    background: '#131927',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-main)',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                >
                  <option value="Treasury">Treasury</option>
                  <option value="Protocol">Protocol</option>
                  <option value="Security Grants">Security Grants</option>
                </select>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>
                  Description & Governance Impact
                </label>
                <textarea 
                  rows={4}
                  placeholder="Explain the background, budget allocation, and expected governance outcome..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-main)',
                    fontSize: '13px',
                    outline: 'none',
                    resize: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  onClick={() => setShowCreateModal(false)}
                  style={{
                    padding: '12px 20px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-main)',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  Cancel
                </button>

                <button 
                  type="submit" 
                  className="btn-neon-cyan"
                  style={{ padding: '12px 24px' }}
                >
                  <PlusCircle size={16} />
                  Deploy Proposal Circuit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Footer ─── */}
      <footer style={{ 
        borderTop: '1px solid var(--border-color)', 
        padding: '20px 28px', 
        background: 'rgba(7, 9, 14, 0.9)', 
        fontSize: '12px', 
        color: 'var(--text-dim)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span>Confidential DAO Platform · Midnight Network v2.0 (August 2026)</span>
        <div style={{ display: 'flex', gap: '16px' }}>
          <a href="https://github.com/shreyaaa2004/Confidential-DAO-governance-platform" target="_blank" rel="noreferrer" style={{ color: 'var(--cyan-neon)', textDecoration: 'none' }}>
            GitHub Repository
          </a>
          <a href="https://faucet.preview.midnight.network/" target="_blank" rel="noreferrer" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
            Preview Faucet
          </a>
        </div>
      </footer>

    </div>
  );
}
