import BN from 'bn.js';
import {KeyPair} from "ton-crypto";
import {Buffer} from "buffer";
import {Address} from "ton";

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

export type PaymentDataJson = {
    isA: boolean,
    channelId: string, // hex
    myKeyPair: { publicKey: string, secretKey: string },
    hisPublicKey: string,
    initBalanceA: string,
    initBalanceB: string,
    addressA: string,
    addressB: string,
    state: { balanceA: string, balanceB: string, seqnoA: string, seqnoB: string }
}
