import BN from 'bn.js';

export type ClosingConfig = {
    quarantineDuration: number | BN,
    misbehaviorFine: number | BN,
    conditionalCloseDuration: number | BN
};

export type ChannelState = {
    balanceA: BN,
    balanceB: BN,
    seqnoA: BN,
    seqnoB: BN
}
