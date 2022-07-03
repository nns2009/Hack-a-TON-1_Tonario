import {
    Address, Cell, Contract, contractAddress, TonClient,
} from 'ton';
import BN from "bn.js";
import { KeyPair, sign, signVerify } from 'ton-crypto';
import { Buffer } from 'buffer';
import { PaymentChannelSource } from './sources/PaymentChannelSource';
import {ChannelState, ClosingConfig, PaymentDataJson} from './types';
import {
    createOneSignature,
    createTwoSignature,
    createTopUpBalance,
    op_init_channel,
    createInitChannelBody,
    op_cooperative_close,
    createCooperativeCloseChannelBody,
    op_cooperative_commit,
    createCooperativeCommitBody,
    createSemiChannelState,
    createSemiChannelBody,
    createSignedSemiChannelState,
    op_start_uncooperative_close,
    createStartUncooperativeCloseBody,
    op_challenge_quarantined_state,
    createChallengeQuarantinedStateBody,
    op_settle_conditionals,
    createSettleConditionalsBody,
    createFinishUncooperativeClose,
} from './PaymentUtils';
import GetMethodParser from '../getMethodParser';

export class PaymentChannel implements Contract {
    static fromJSON(json: PaymentDataJson) {
        const isA = json.isA
        const channelId = new BN(json.channelId, 16)
        const myKeyPair = {publicKey: Buffer.from(json.myKeyPair.publicKey, 'hex'), secretKey: Buffer.from(json.myKeyPair.secretKey, 'hex')}
        const hisPublicKey = Buffer.from(json.hisPublicKey, 'hex')
        const initBalanceA = new BN(json.initBalanceA, 16)
        const initBalanceB = new BN(json.initBalanceB, 16)
        const addressA = Address.parse(json.addressA)
        const addressB = Address.parse(json.addressB)
        const state = {
            balanceA: new BN(json.state.balanceA, 16),
            balanceB: new BN(json.state.balanceB, 16),
            seqnoA: new BN(json.state.seqnoA, 16),
            seqnoB: new BN(json.state.seqnoB, 16)}
        return PaymentChannel.create({isA, channelId, myKeyPair, hisPublicKey, initBalanceA, initBalanceB, addressA, addressB, state})
    }
    static create(opts: {
        isA: boolean,
        channelId: BN,
        myKeyPair: KeyPair,
        hisPublicKey: Buffer,
        initBalanceA: BN,
        initBalanceB: BN,
        addressA: Address,
        addressB: Address,
        closingConfig?: ClosingConfig,
        excessFee?: BN,
        state?: ChannelState
    }) {
        const workchain = 0;
        const publicKeyA = opts.isA ? opts.myKeyPair.publicKey : opts.hisPublicKey;
        const publicKeyB = !opts.isA ? opts.myKeyPair.publicKey : opts.hisPublicKey;
        const source = PaymentChannelSource.create({
            workchain,
            publicKeyA,
            publicKeyB,
            channelId: opts.channelId,
            excessFee: opts.excessFee,
            addressA: opts.addressA,
            addressB: opts.addressB,
        });
        const address = contractAddress(source);

        const zero = new BN(0);
        const channelState = opts.state ?? {seqnoA: zero, seqnoB: zero, balanceA: opts.initBalanceA, balanceB: opts.initBalanceB}

        return new PaymentChannel(
            workchain,
            publicKeyA,
            publicKeyB,
            opts.isA,
            opts.channelId,
            opts.myKeyPair,
            opts.initBalanceA,
            opts.initBalanceB,
            opts.addressA,
            opts.addressB,
            source,
            address,
            channelState,
            opts.closingConfig,
            opts.excessFee,
        );
    }

    readonly address: Address;

    readonly source: PaymentChannelSource;

    readonly workchain: number;

    readonly isA: boolean;

    readonly myKeyPair: KeyPair;

    readonly publicKeyA: Buffer;

    readonly publicKeyB: Buffer;

    readonly initBalanceA: BN;

    readonly initBalanceB: BN;

    readonly channelId: number | BN;

    readonly excessFee?: number | BN;

    readonly addressA: Address;

    readonly addressB: Address;

    readonly closingConfig?: ClosingConfig;

    private pChannelState: ChannelState;

    constructor(
        workchain: number,
        publicKeyA: Buffer,
        publicKeyB: Buffer,
        isA: boolean,
        channelId: BN,
        myKeyPair: KeyPair,
        initBalanceA: BN,
        initBalanceB: BN,
        addressA: Address,
        addressB: Address,
        source: PaymentChannelSource,
        address: Address,
        channelState: ChannelState,
        closingConfig?: ClosingConfig,
        excessFee?: BN,
    ) {
        this.address = address;
        this.source = source;
        this.workchain = workchain;
        this.isA = isA;
        this.channelId = channelId;
        this.myKeyPair = myKeyPair;
        this.publicKeyA = publicKeyA;
        this.publicKeyB = publicKeyB;
        this.initBalanceA = initBalanceA;
        this.initBalanceB = initBalanceB;
        this.addressA = addressA;
        this.addressB = addressB;
        this.pChannelState = channelState;
        this.closingConfig = closingConfig;
        this.excessFee = excessFee;
    }

    async createOneSignature(
        op: number,
        cellForSigning: Cell,
    ): Promise<{ cell: Cell, signature: Buffer }> {
        const signature = sign(cellForSigning.hash(), this.myKeyPair.secretKey);
        // const signature = nacl.sign.detached(await cellForSigning.hash(), this.options.myKeyPair.secretKey);

        const cell = createOneSignature({
            op,
            isA: this.isA,
            signature,
            cell: cellForSigning,
        });

        return {
            cell,
            signature,
        };
    }

    async createTwoSignature(
        op: number,
        hisSignature: Buffer,
        cellForSigning: Cell,
    ): Promise<{ cell: Cell, signature: Buffer }> {
        const signature = sign(cellForSigning.hash(), this.myKeyPair.secretKey);

        const signatureA = this.isA ? signature : hisSignature;
        const signatureB = !this.isA ? signature : hisSignature;

        const cell = createTwoSignature({
            op,
            signatureA,
            signatureB,
            cell: cellForSigning,
        });

        return {
            cell,
            signature,
        };
    }

    createTopUpBalance(params: { coinsA: BN, coinsB: BN }): Cell {
        return createTopUpBalance(params);
    }

    async createInitChannel(params: {
        balanceA: BN, balanceB: BN
    }): Promise<{ cell: Cell, signature: Buffer }> {
        return this.createOneSignature(
            op_init_channel,
            createInitChannelBody({
                ...params,
                channelId: this.channelId,
            }),
        );
    }

    async createCooperativeCloseChannel(params: {
        hisSignature?: Buffer,
        balanceA: BN,
        balanceB: BN,
        seqnoA: BN,
        seqnoB: BN
    }): Promise<{ cell: Cell, signature: Buffer }> {
        return this.createTwoSignature(
            op_cooperative_close,
            params.hisSignature ?? new Buffer(512 / 8),
            createCooperativeCloseChannelBody({
                ...params,
                channelId: this.channelId,
            }),
        );
    }

    async createCooperativeCommit(params: {
        hisSignature?: Buffer, seqnoA: BN, seqnoB: BN
    }): Promise<{ cell: Cell, signature: Buffer }> {
        return this.createTwoSignature(
            op_cooperative_commit,
            params.hisSignature ?? new Buffer(512 / 8),
            createCooperativeCommitBody({
                ...params,
                channelId: this.channelId,
            }),
        );
    }

    async createSignedSemiChannelState(params: {
        mySeqno: BN, mySentCoins: BN, hisSeqno?: BN, hisSentCoins?: BN
    }): Promise<{ cell: Cell, signature: Buffer }> {
        const state = createSemiChannelState({
            channelId: this.channelId,
            semiChannelBody: createSemiChannelBody({
                seqno: params.mySeqno,
                sentCoins: params.mySentCoins,
                conditionals: undefined,
            }),
            counterpartySemiChannelBody: params.hisSeqno === undefined ? undefined : createSemiChannelBody({
                seqno: params.hisSeqno,
                sentCoins: params.hisSentCoins ?? new BN(0),
                conditionals: undefined,
            }),
        });
        // const signature = nacl.sign.detached(await state.hash(), this.options.myKeyPair.secretKey);
        const signature = sign(state.hash(), this.myKeyPair.secretKey);
        const cell = createSignedSemiChannelState({
            signature,
            state,
        });
        return {
            cell,
            signature,
        };
    }

    async signState(params: {
        balanceA: BN, balanceB: BN, seqnoA: BN, seqnoB: BN
    }): Promise<Buffer> {
        const mySeqno = this.isA ? params.seqnoA : params.seqnoB;
        const hisSeqno = !this.isA ? params.seqnoA : params.seqnoB;

        const sentCoinsA = this.initBalanceA.gt(params.balanceA) ? this.initBalanceA.sub(params.balanceA) : new BN(0);
        const sentCoinsB = this.initBalanceB.gt(params.balanceB) ? this.initBalanceB.sub(params.balanceB) : new BN(0);

        const mySentCoins = this.isA ? sentCoinsA : sentCoinsB;
        const hisSentCoins = !this.isA ? sentCoinsA : sentCoinsB;

        const {
            cell,
            signature,
        } = await this.createSignedSemiChannelState({
            mySeqno,
            mySentCoins,
            hisSeqno,
            hisSentCoins,
        });

        return signature;
    }

    async verifyState(params: {
        balanceA: BN, balanceB: BN, seqnoA: BN, seqnoB: BN
    }, hisSignature: Buffer): Promise<boolean> {
        const mySeqno = !this.isA ? params.seqnoA : params.seqnoB;
        const hisSeqno = this.isA ? params.seqnoA : params.seqnoB;

        const sentCoinsA = this.initBalanceA.gt(params.balanceA) ? this.initBalanceA.sub(params.balanceA) : new BN(0);
        const sentCoinsB = this.initBalanceB.gt(params.balanceB) ? this.initBalanceB.sub(params.balanceB) : new BN(0);

        const mySentCoins = !this.isA ? sentCoinsA : sentCoinsB;
        const hisSentCoins = this.isA ? sentCoinsA : sentCoinsB;

        const state = createSemiChannelState({
            channelId: this.channelId,
            semiChannelBody: createSemiChannelBody({
                seqno: mySeqno,
                sentCoins: mySentCoins,
                conditionals: undefined,
            }),
            counterpartySemiChannelBody: hisSeqno === undefined ? undefined : createSemiChannelBody({
                seqno: hisSeqno,
                sentCoins: hisSentCoins,
                conditionals: undefined,
            }),
        });
        return signVerify(
            state.hash(),
            hisSignature,
            this.isA ? this.publicKeyB : this.publicKeyA,
        );
    }

    async signClose(params: {
        balanceA: BN, balanceB: BN, seqnoA: BN, seqnoB: BN
    }): Promise<Buffer> {
        const {
            cell,
            signature,
        } = await this.createCooperativeCloseChannel(params);
        return signature;
    }

    async verifyClose(params: {
        balanceA: BN, balanceB: BN, seqnoA: BN, seqnoB: BN
    }, hisSignature: Buffer): Promise<boolean> {
        const cell = await createCooperativeCloseChannelBody({
            ...params,
            channelId: this.channelId,
        });
        const hash = await cell.hash();
        // return nacl.sign.detached.verify(hash, hisSignature, this.options.isA ? this.options.publicKeyB : this.options.publicKeyA);
        return signVerify(
            cell.hash(),
            hisSignature,
            this.isA ? this.publicKeyB : this.publicKeyA,
        );
    }

    async createStartUncooperativeClose(params: {
        signedSemiChannelStateA: Cell, signedSemiChannelStateB: Cell
    }): Promise<{ cell: Cell, signature: Buffer }> {
        return this.createOneSignature(
            op_start_uncooperative_close,
            createStartUncooperativeCloseBody({
                ...params,
                channelId: this.channelId,
            }),
        );
    }

    async createChallengeQuarantinedState(params: {
        signedSemiChannelStateA: Cell, signedSemiChannelStateB: Cell
    }): Promise<{ cell: Cell, signature: Buffer }> {
        return this.createOneSignature(
            op_challenge_quarantined_state,
            createChallengeQuarantinedStateBody({
                ...params,
                channelId: this.channelId,
            }),
        );
    }

    async createSettleConditionals(params: {
        conditionalsToSettle?: Cell
    }): Promise<{ cell: Cell, signature: Buffer }> {
        return this.createOneSignature(
            op_settle_conditionals,
            createSettleConditionalsBody({
                ...params,
                channelId: this.channelId,
            }),
        );
    }

    createFinishUncooperativeClose(): Cell {
        return createFinishUncooperativeClose();
    }

    static STATE_UNINITED = 0;

    static STATE_OPEN = 1;

    static STATE_CLOSURE_STARTED = 2;

    static STATE_SETTLING_CONDITIONALS = 3;

    static STATE_AWAITING_FINALIZATION = 4;

    async getChannelState(client: TonClient): Promise<number> {
        const { stack, exit_code } = await client.callGetMethodWithError(this.address, 'get_channel_state');
        if (exit_code < 0) { return PaymentChannel.STATE_UNINITED; }
        return new BN(stack[0][1].replace(/^0x/, ''), 'hex').toNumber();
    }

    async getData(client: TonClient): Promise<{
        state: number,
        balanceA: BN,
        balanceB: BN,
        publicKeyA: Buffer,
        publicKeyB: Buffer,
        channelId: BN,
        quarantineDuration: number,
        misbehaviorFine: BN,
        conditionalCloseDuration: number,
        seqnoA: BN,
        seqnoB: BN,
        quarantine: Cell,
        excessFee: BN,
        addressA: Address,
        addressB: Address
    }> {
        const bnToBytes = (bn: BN): Buffer => {
            let hex = bn.toString(16);
            if (hex.length % 2 !== 0) hex = `0${hex}`;
            return Buffer.from(hex, 'hex');
        };
        const { stack } = await client.callGetMethod(this.address, 'get_channel_data');

        const result = GetMethodParser.parseStack(stack);
        console.log(result);
        const state = result[0].toNumber();
        const balanceA = result[1][0];
        const balanceB = result[1][1];
        const publicKeyA = bnToBytes(result[2][0]);
        const publicKeyB = bnToBytes(result[2][1]);
        const channelId = result[3];
        const quarantineDuration = result[4][0].toNumber();
        const misbehaviorFine = result[4][1];
        const conditionalCloseDuration = result[4][2].toNumber();
        const seqnoA = result[5][0];
        const seqnoB = result[5][1];
        const quarantine = result[6]; // Cell
        const excessFee = result[7][0];
        const addressA = result[7][1].beginParse()
            .readAddress()!;
        const addressB = result[7][2].beginParse()
            .readAddress()!;
        return {
            state,
            balanceA,
            balanceB,
            publicKeyA,
            publicKeyB,
            channelId,
            quarantineDuration,
            misbehaviorFine,
            conditionalCloseDuration,
            seqnoA,
            seqnoB,
            quarantine,
            excessFee,
            addressA,
            addressB,
        };
    }

    get channelState() {
        return this.pChannelState;
    }

    set channelState(newState) {
        this.pChannelState = newState;
    }

    toJSON(): PaymentDataJson {
        return {
            isA: this.isA,
            channelId: this.channelId.toString(16), // hex
            myKeyPair: { publicKey: this.myKeyPair.publicKey.toString('hex'), secretKey: this.myKeyPair.secretKey.toString('hex') },
            hisPublicKey: this.publicKeyB.toString('hex'),
            initBalanceA: this.initBalanceA.toString(16),
            initBalanceB: this.initBalanceB.toString(16),
            addressA: this.addressA.toFriendly(),
            addressB: this.addressB.toFriendly(),
            state: {
                balanceA: this.channelState.balanceA.toString(16),
                balanceB: this.channelState.balanceB.toString(16),
                seqnoA: this.channelState.seqnoA.toString(16),
                seqnoB: this.channelState.seqnoB.toString(16)
            }
        }
    }
}
