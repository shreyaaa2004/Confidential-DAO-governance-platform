import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type Witnesses<PS> = {
}

export type ImpureCircuits<PS> = {
  createProposal(context: __compactRuntime.CircuitContext<PS>,
                 initialTitle_0: string): __compactRuntime.CircuitResults<PS, []>;
  castVote(context: __compactRuntime.CircuitContext<PS>, voteChoice_0: boolean): __compactRuntime.CircuitResults<PS, []>;
  finalizeProposal(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
}

export type ProvableCircuits<PS> = {
  createProposal(context: __compactRuntime.CircuitContext<PS>,
                 initialTitle_0: string): __compactRuntime.CircuitResults<PS, []>;
  castVote(context: __compactRuntime.CircuitContext<PS>, voteChoice_0: boolean): __compactRuntime.CircuitResults<PS, []>;
  finalizeProposal(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
}

export type PureCircuits = {
}

export type Circuits<PS> = {
  createProposal(context: __compactRuntime.CircuitContext<PS>,
                 initialTitle_0: string): __compactRuntime.CircuitResults<PS, []>;
  castVote(context: __compactRuntime.CircuitContext<PS>, voteChoice_0: boolean): __compactRuntime.CircuitResults<PS, []>;
  finalizeProposal(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
}

export type Ledger = {
  readonly proposalId: bigint;
  readonly title: string;
  readonly yesVotes: bigint;
  readonly noVotes: bigint;
  readonly voterCount: bigint;
  readonly isFinalized: boolean;
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
