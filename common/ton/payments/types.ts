import BN from 'bn.js';

export type ClosingConfig = {
    quarantineDuration: number | BN,
    misbehaviorFine: number | BN,
    conditionalCloseDuration: number | BN
};
