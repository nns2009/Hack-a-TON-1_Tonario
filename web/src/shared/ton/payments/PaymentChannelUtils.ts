import {Wallet} from "../ton-wallet/types/Wallet";
import {PaymentChannel} from "./PaymentChannel";
import {tonClient} from "../index";
import BN from "bn.js";
import {Address, Cell, CellMessage, CommonMessageInfo, ExternalMessage, StateInit, toNano} from "ton";
import {mnemonicToWalletKey, mnemonicNew, KeyPair} from "ton-crypto";
import {InternalMessage} from "ton";
import GetMethodParser from "../getMethodParser";
import {tonWalletAdapter} from "../ton-wallet/TonWalletWalletAdapter";
import {Buffer} from "buffer";
import API from "../../../API";
import {hexToBuffer} from "../utils";
import { SetPendingFunction } from "../../../App";

const createChannel = async (clientAddress: string, clientPublicKey: Buffer) => {
    const {channelId, serviceAddress, servicePublicKey} = await API.createChannel({clientAddress, clientPublicKey: clientPublicKey.toString('hex')});
    return {channelId: new BN(channelId, 16), address: serviceAddress, publicKey: hexToBuffer(servicePublicKey)};
}



const getOpenChannelBody = async (wallet: Wallet, channel: PaymentChannel): Promise<Cell> => {
    const openChannelBody = new Cell();

    // deploy
    const msg1 = new Cell();
    new InternalMessage({
        to: channel.address,
        value: toNano(0.015),
        bounce: false,
        body: new CommonMessageInfo({
            stateInit: new StateInit({
                code: channel.source.initialCode,
                data: channel.source.initialData,
            }),
            body: undefined
        })
    }).writeTo(msg1);

    // top up
    const msg2 = new Cell();
    new InternalMessage({
        to: channel.address,
        value: channel.initBalanceA.add(toNano(0.015)),
        bounce: false,
        body: new CommonMessageInfo({
            stateInit: undefined,
            body: new CellMessage(channel.createTopUpBalance({
                coinsA: channel.initBalanceA,
                coinsB: toNano(0),
            }))
        })
    }).writeTo(msg2);

    // init
    const msg3 = new Cell();
    new InternalMessage({
        to: channel.address,
        value: toNano(0.02),
        bounce: false,
        body: new CommonMessageInfo({
            stateInit: undefined,
            body: new CellMessage(await channel.createInitChannel({
                    balanceA: channel.initBalanceA,
                    balanceB: channel.initBalanceB
            }).then((x) => x.cell))
        })
    }).writeTo(msg3);

    const { stack } = await tonClient.callGetMethod(Address.parse(wallet.address), 'seqno');
    const seqno = GetMethodParser.parseStack(stack);

    openChannelBody.bits.writeUint(698983191,32) // subwalletID
    openChannelBody.bits.writeUint(Math.round(Date.now() / 1000) + 60,32) // validUntil
    openChannelBody.bits.writeUint(seqno,32) // seqno
    openChannelBody.bits.writeUint(3,8);
    openChannelBody.bits.writeUint(3,8);
    openChannelBody.bits.writeUint(3,8);

    openChannelBody.refs[0] = msg1;
    openChannelBody.refs[1] = msg2;
    openChannelBody.refs[2] = msg3;
    return openChannelBody;
}


export const openPaymentChannel = async (
    wallet: Wallet, amount: number,
    setPending: SetPendingFunction,
): Promise<PaymentChannel> => {
    const myKeyPair = await mnemonicToWalletKey(await mnemonicNew(24));
    const channelService = await createChannel(wallet.address, myKeyPair.publicKey);
    console.log(myKeyPair, channelService)
    const { balance } = await tonClient.getContractState(Address.parse(wallet.address));
    const initAmount = toNano(amount);
    if (balance.sub(toNano(0.05)).lt(initAmount)) {
        alert("Insufficient balance")
        throw Error("Insufficient balance")
    }
    const channelConfig = {
        isA: true,
        channelId: channelService.channelId,
        myKeyPair,
        hisPublicKey: channelService.publicKey,
        initBalanceA: initAmount,
        initBalanceB: new BN(0),
        addressA: Address.parse(wallet.address),
        addressB: Address.parse(channelService.address),
    }
    const channel = PaymentChannel.create(channelConfig)

    const openChannelBody = await getOpenChannelBody(wallet, channel);

    await tonWalletAdapter.awaitReadiness();
    await tonWalletAdapter.requestCustomTransfer(openChannelBody);

    setPending("Pending payment channel approval");
    const sleep = (m: any) => new Promise(r => setTimeout(r, m))

    for (let x = 0; x < 100; x++) {
        const state = await channel.getChannelState(tonClient)
        if (state === PaymentChannel.STATE_OPEN) {
            await API.initChannel({channelId: channel.channelId.toString(16)});
            setPending(null);
            return channel;
        }
        await sleep(1000)
    }
    throw Error('Payment Channel not open')
}

export const signSendTons = async (channel: PaymentChannel, amount: BN): Promise<string> => {
    let channelState = channel.channelState;
    console.log(channelState.balanceA.toNumber(), amount.toNumber());
    if (channel.isA) {
        channelState.seqnoA = channelState.seqnoA.add(new BN(1));
        if (channelState.balanceA.lt(amount)) throw Error("Insufficient balance")
        channelState.balanceA = channelState.balanceA.sub(amount);
        channelState.balanceB = channelState.balanceB.add(amount);
    } else {
        channelState.seqnoB = channelState.seqnoB.add(new BN(1));
        if (channelState.balanceB.lt(amount)) throw Error("Insufficient balance")
        channelState.balanceB = channelState.balanceB.sub(amount);
        channelState.balanceA = channelState.balanceA.add(amount);
    }
    console.log(channelState.balanceA.toNumber(), channelState.balanceB.toNumber(), amount.toNumber());
    channel.channelState = channelState;
    const sign = await channel.signState(channel.channelState);
    return sign.toString('hex');
}

export const signReceiveTons = async (channel: PaymentChannel, amount: BN): Promise<string> => {
    let channelState = channel.channelState;
    if (!channel.isA) {
        channelState.seqnoA = channelState.seqnoA.add(new BN(1));
        if (channelState.balanceA.lt(amount)) throw Error("Insufficient balance")
        channelState.balanceA = channelState.balanceA.sub(amount);
        channelState.balanceB = channelState.balanceB.add(amount);
    } else {
        channelState.seqnoB = channelState.seqnoB.add(new BN(1));
        if (channelState.balanceB.lt(amount)) throw Error("Insufficient balance")
        channelState.balanceB = channelState.balanceB.sub(amount);
        channelState.balanceA = channelState.balanceA.add(amount);
    }

    channel.channelState = channelState;
    const sign = await channel.signState(channel.channelState);
    return sign.toString('hex');
}

export const closePaymentChannel = async (paymentChannel: PaymentChannel) => {
    const close = await API.closeChannel({channelId: paymentChannel.channelId.toString(16)})

    const closeState = {
        balanceA: new BN(close.state.balanceA, 16), balanceB: new BN(close.state.balanceB, 16),
        seqnoA: new BN(close.state.seqnoA, 16), seqnoB: new BN(close.state.seqnoB, 16)
    }
    const closeBody = await paymentChannel.createCooperativeCloseChannel({...closeState, hisSignature: hexToBuffer(close.signature)}).then((x) => x.cell);
    // close
    const closeChannelMsg = new ExternalMessage({
        to: paymentChannel.address,
        body: new CommonMessageInfo({
            stateInit: undefined,
            body: new CellMessage(closeBody),
        })
    })
    await tonClient.sendMessage(closeChannelMsg);
    localStorage.clear()
    document.location.reload();
    return;
}
