import {Wallet} from "../ton-wallet/types/Wallet";
import {PaymentChannel} from "./PaymentChannel";
import {tonClient} from "../index";
import BN from "bn.js";
import {Address, Cell, CellMessage, CommonMessageInfo, StateInit, toNano} from "ton";
import axios from "axios";
import {mnemonicToWalletKey, mnemonicNew} from "ton-crypto";
import {InternalMessage} from "ton";
import GetMethodParser from "../getMethodParser";
import {tonWalletAdapter} from "../ton-wallet/TonWalletWalletAdapter";
import {Buffer} from "buffer";

const createChannel = async (clientAddress: string, clientPublicKey: Buffer) => {
    const hexToBuffer = (hex: string): Buffer => {
      if (hex.length % 2 !== 0) hex = `0${hex}`;
      return Buffer.from(hex, 'hex');
    };
    let headers: Record<string, any> = {
            'Content-Type': 'application/json',
        }
    let res = await axios.post('http://localhost:3200/create-channel', JSON.stringify({
            clientAddress,
            clientPublicKey: clientPublicKey.toString('hex')
        }), {
            headers,
            timeout: 5000,
        });
    if (res.status !== 200) {
        throw Error('Received error: ' + JSON.stringify(res.data));
    }
    const {channelId, serviceAddress, servicePublicKey} = res.data;
    return {channelId: new BN(channelId, 16), address: serviceAddress, publicKey: hexToBuffer(servicePublicKey)};
}

const initChannel = async (channel: PaymentChannel) => {
    let headers: Record<string, any> = {
            'Content-Type': 'application/json',
        }
    let res = await axios.post('http://localhost:3200/init-channel', JSON.stringify({
            channelId: channel.channelId
        }), {
            headers,
            timeout: 5000,
        });
    if (res.status !== 200) {
        throw Error('Received error: ' + JSON.stringify(res.data));
    }
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


export const openPaymentChannel = async (wallet: Wallet, amount: number): Promise<PaymentChannel> => {
    const myKeyPair = await mnemonicToWalletKey(await mnemonicNew(24));
    const channelService = await createChannel(wallet.address, myKeyPair.publicKey);
    console.log(myKeyPair, channelService)
    const channelConfig = {
        isA: true,
        channelId: channelService.channelId,
        myKeyPair,
        hisPublicKey: channelService.publicKey,
        initBalanceA: toNano(amount),
        initBalanceB: new BN(0),
        addressA: Address.parse(wallet.address),
        addressB: Address.parse(channelService.address),
    }
    const channel = PaymentChannel.create(tonClient, channelConfig)

    const openChannelBody = await getOpenChannelBody(wallet, channel);

    await tonWalletAdapter.createSession();
    await tonWalletAdapter.requestCustomTransfer(openChannelBody);

    const sleep = (m: any) => new Promise(r => setTimeout(r, m))

    for (let x = 0; x < 15; x++) {
        const state = await channel.getChannelState()
        if (state === PaymentChannel.STATE_OPEN) {
            await initChannel(channel);
            return channel;
        }
        await sleep(1000)
    }
    throw Error('Payment Channel not open')
}
