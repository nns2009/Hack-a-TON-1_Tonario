import { Buffer } from 'buffer';
import { Cell } from 'ton';
import BN from 'bn.js';

export const writePublicKey = (cell: Cell, publicKey: Buffer) => {
    if (publicKey.length !== 256 / 8) {
        throw new Error('invalid publicKey length');
    }
    cell.bits.writeBuffer(publicKey);
};

export const writeSignature = (cell: Cell, signature: Buffer) => {
    if (signature.length !== 512 / 8) {
        throw new Error('invalid signature length');
    }
    cell.bits.writeBuffer(signature);
};

export const createSignatureCell = (signature: Buffer): Cell => {
    const cell = new Cell();
    writeSignature(cell, signature);
    return cell;
};

export const writeMayBe = (cell: Cell, ref?: Cell) => {
    if (ref) {
        cell.bits.writeBit(1);
        if (cell.refs.length >= 4) {
            throw new Error('refs overflow');
        }
        cell.refs.push(ref);
    } else {
        cell.bits.writeBit(0);
    }
};

export const writeDict = writeMayBe;

export const tag_init = 0x696e6974;
export const tag_cooperative_close = 0x436c6f73;
export const tag_cooperative_commit = 0x43436d74;
export const tag_start_uncooperative_close = 0x556e436c;
export const tag_challenge_state = 0x43686751;
export const tag_settle_conditionals = 0x436c436e;
export const tag_state = 0x43685374;

export const op_top_up_balance = 1741148801; // crc32("top_up_balance add_A:Coins add_B:Coins = InternalMsgBody");
export const op_init_channel = 235282626; // crc32("init_channel is_A:Bool signature:bits512 tag:# = tag 1768843636 channel_id:uint128 balance_A:Coins balance_B:Coins = InternalMsgBody");
export const op_cooperative_close = 1433884798; // crc32("cooperative_close sig_A:^bits512 sig_B:^bits512 tag:# = tag 1131179891 channel_id:uint128 balance_A:Coins balance_B:Coins seqno_A:uint64 seqno_B:uint64 = InternalMsgBody");
export const op_cooperative_commit = 2040604399; // crc32("cooperative_commit sig_A:^bits512 sig_B:^bits512 tag:# = tag 1128492404 channel_id:uint128 seqno_A:uint64 seqno_B:uint64 = InternalMsgBody");
export const op_start_uncooperative_close = 521476815; // crc32("start_uncooperative_close signed_by_A:Bool signature:bits512 tag:# = tag 1433289580 channel_id:uint128 sch_A:^SignedSemiChannel sch_B:^SignedSemiChannel = InternalMsgBody");
export const op_challenge_quarantined_state = 143567410; // crc32("challenge_quarantined_state challenged_by_A:Bool signature:bits512 tag:# = tag 1130915665 channel_id:uint128 sch_A:^SignedSemiChannel sch_B:^SignedSemiChannel = InternalMsgBody");
export const op_settle_conditionals = 1727459433; // crc32("settle_conditionals from_A:Bool signature:bits512 tag:# = tag 1131168622 channel_id:uint128 conditionals_to_settle:HashmapE 32 Cell = InternalMsgBody");
export const op_finish_uncooperative_close = 625158801; // crc32("finish_uncooperative_close = InternalMsgBody");
export const op_channel_closed = -572749638; // crc32("channel_closed channel_id:uint128 = InternalMsgBody");

export const createTopUpBalance = (params: { coinsA: BN, coinsB: BN }): Cell => {
    const cell = new Cell();
    cell.bits.writeUint(op_top_up_balance, 32); // OP
    cell.bits.writeCoins(params.coinsA);
    cell.bits.writeCoins(params.coinsB);
    return cell;
};

export const createInitChannelBody = (params: {
    channelId: number | BN, balanceA: BN, balanceB: BN
}): Cell => {
    const cell = new Cell();
    cell.bits.writeUint(tag_init, 32);
    cell.bits.writeUint(params.channelId, 128);
    cell.bits.writeCoins(params.balanceA);
    cell.bits.writeCoins(params.balanceB);
    return cell;
};

export const createCooperativeCloseChannelBody = (params: {
    channelId: number | BN,
    balanceA: BN,
    balanceB: BN,
    seqnoA: BN,
    seqnoB: BN
}): Cell => {
    const cell = new Cell();
    cell.bits.writeUint(tag_cooperative_close, 32);
    cell.bits.writeUint(params.channelId, 128);
    cell.bits.writeCoins(params.balanceA);
    cell.bits.writeCoins(params.balanceB);
    cell.bits.writeUint(params.seqnoA, 64);
    cell.bits.writeUint(params.seqnoB, 64);
    return cell;
};

export const createCooperativeCommitBody = (params: {
    channelId: number | BN, seqnoA: BN, seqnoB: BN
}): Cell => {
    const cell = new Cell();
    cell.bits.writeUint(tag_cooperative_commit, 32);
    cell.bits.writeUint(params.channelId, 128);
    cell.bits.writeUint(params.seqnoA, 64);
    cell.bits.writeUint(params.seqnoB, 64);
    return cell;
};

export const createConditionalPayment = (params: { amount: BN, condition: Cell }): Cell => {
    const cell = new Cell();
    cell.bits.writeCoins(params.amount);
    cell.writeCell(params.condition);
    return cell;
};

export const createSemiChannelBody = (params: {
    seqno: BN, sentCoins: BN, conditionals?: Cell
}): Cell => {
    const cell = new Cell();
    cell.bits.writeUint(params.seqno, 64); // body start
    cell.bits.writeCoins(params.sentCoins);
    writeDict(cell, params.conditionals); // HashmapE 32 ConditionalPayment
    return cell;
};

export const createSemiChannelState = (params: {
    channelId: number | BN,
    semiChannelBody: Cell,
    counterpartySemiChannelBody?: Cell
}): Cell => {
    const cell = new Cell();
    cell.bits.writeUint(tag_state, 32);
    cell.bits.writeUint(params.channelId, 128);
    cell.writeCell(params.semiChannelBody);
    writeMayBe(cell, params.counterpartySemiChannelBody);
    return cell;
};

export const createSignedSemiChannelState = (params: { signature: Buffer, state: Cell }): Cell => {
    const cell = new Cell();
    writeSignature(cell, params.signature);
    cell.writeCell(params.state);
    return cell;
};

export const createStartUncooperativeCloseBody = (params: {
    channelId: number | BN,
    signedSemiChannelStateA: Cell,
    signedSemiChannelStateB: Cell
}): Cell => {
    const cell = new Cell();
    cell.bits.writeUint(tag_start_uncooperative_close, 32);
    cell.bits.writeUint(params.channelId, 128);
    cell.refs[0] = params.signedSemiChannelStateA;
    cell.refs[1] = params.signedSemiChannelStateB;
    return cell;
};

export const createChallengeQuarantinedStateBody = (params: {
    channelId: number | BN,
    signedSemiChannelStateA: Cell,
    signedSemiChannelStateB: Cell
}): Cell => {
    const cell = new Cell();
    cell.bits.writeUint(tag_challenge_state, 32);
    cell.bits.writeUint(params.channelId, 128);
    cell.refs[0] = params.signedSemiChannelStateA;
    cell.refs[1] = params.signedSemiChannelStateB;
    return cell;
};

export const createSettleConditionalsBody = (params: {
    channelId: number | BN, conditionalsToSettle?: Cell
}): Cell => {
    const cell = new Cell();
    cell.bits.writeUint(tag_settle_conditionals, 32);
    cell.bits.writeUint(params.channelId, 128);
    writeDict(cell, params.conditionalsToSettle); // HashmapE 32 Cell
    return cell;
};

export const createFinishUncooperativeClose = (): Cell => {
    const cell = new Cell();
    cell.bits.writeUint(op_finish_uncooperative_close, 32); // OP
    return cell;
};

export const createOneSignature = (params: {
    op: number, isA: boolean, signature: Buffer, cell: Cell
}): Cell => {
    const cell = new Cell();
    cell.bits.writeUint(params.op, 32); // OP
    cell.bits.writeBit(params.isA);
    writeSignature(cell, params.signature);
    cell.writeCell(params.cell);
    return cell;
};

export const createTwoSignature = (params: {
    op: number, signatureA: Buffer, signatureB: Buffer, cell: Cell
}): Cell => {
    const cell = new Cell();
    cell.bits.writeUint(params.op, 32); // OP
    cell.refs[0] = createSignatureCell(params.signatureA);
    cell.refs[1] = createSignatureCell(params.signatureB);
    cell.writeCell(params.cell);
    return cell;
};
