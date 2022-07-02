import {
    Cell,
    CellMessage,
    CommonMessageInfo,
    InternalMessage, StateInit,
    toNano, TonClient, Wallet, WalletContract, WalletV3R2Source,
} from 'ton';
import BN from 'bn.js';
import { keyPairFromSeed, mnemonicToWalletKey } from 'ton-crypto';
import { Buffer } from 'buffer';
import { PaymentChannel } from './PaymentChannel';
import { createTopUpBalance } from './PaymentUtils';

const createWallet = (
    client: TonClient,
    publicKey: Buffer,
): Wallet => client.openWalletFromCustomContract(
    WalletV3R2Source.create({
        publicKey,
        workchain: 0,
    }),
);

const SendToChannel = async (
    client: TonClient,
    publicKey: Buffer,
    secretKey: Buffer,
    channel: PaymentChannel,
    value: BN,
    stateInit?: boolean,
    body?: Cell,
) => {
    const walletV3 = WalletContract.create(client, WalletV3R2Source.create({
        publicKey,
        workchain: 0,
    }));
    const code = channel.source.initialCode;
    const data = channel.source.initialData;
    await client.sendExternalMessage(
        walletV3,
        walletV3.createTransfer({
            seqno: await walletV3.getSeqNo(),
            sendMode: 3,
            order: new InternalMessage({
                to: channel.address,
                value,
                bounce: false,
                body: new CommonMessageInfo({
                    stateInit: stateInit ? new StateInit({
                        code,
                        data,
                    }) : undefined,
                    body: body ? new CellMessage(body) : undefined,
                }),
            }),
            secretKey,
        }),
    );
};

const init = async () => {
    const testRpcUrl = 'https://testnet.toncenter.com/api/v2/jsonRPC';
    const testApiKey = '09f1e024cbb6af1b0f608631c42b1427313407b7aa385009195e3f5c09d51fb8';

    const testClient = new TonClient({
        endpoint: testRpcUrl,
        apiKey: testApiKey,
    });
    const words = ['guilt', 'click', 'banana', 'dirt', 'hint', 'bulk',
        'escape', 'candy', 'column', 'over', 'catalog', 'abandon',
        'draft', 'paper', 'caught', 'pave', 'train', 'pupil',
        'humble', 'trial', 'tiny', 'help', 'tilt', 'sun'];

    const keyPairA = await mnemonicToWalletKey(words);

    const seedB = Buffer.from('at58J2v6FaSuXFGcyGtqT5elpVxcZ+I1zgu/GUfA5uY=', 'base64'); // B's private (secret) key
    const keyPairB = keyPairFromSeed(seedB); // Obtain key pair (public key and private key)

    // if you are new to cryptography then the public key is like a login, and the private key is like a password.
    // Login can be shared with anyone, password cannot be shared with anyone.

    // With a key pair, you can create a wallet.
    // Note that this is just an object, we are not deploying anything to the blockchain yet.
    // Transfer some amount of test coins to this wallet address (from your wallet app).
    // To check you can use blockchain explorer https://testnet.tonscan.org/address/<WALLET_ADDRESS>

    const walletA = createWallet(testClient, keyPairA.publicKey);
    const walletAddressA = walletA.address;
    console.log('walletAddressA = ', walletAddressA.toFriendly());

    const walletB = createWallet(testClient, keyPairB.publicKey);
    const walletAddressB = walletB.address;
    console.log('walletAddressB = ', walletAddressB.toFriendly());

    //----------------------------------------------------------------------
    // PREPARE PAYMENT CHANNEL

    // The parties agree on the configuration of the payment channel.
    // They share information about the payment channel ID, their public keys, their wallet addresses for withdrawing coins, initial balances.
    // They share this information off-chain, for example via a websocket.

    const channelInitState = {
        balanceA: toNano('1'), // A's initial balance in Toncoins. Next A will need to make a top-up for this amount
        balanceB: toNano('0'), // B's initial balance in Toncoins. Next B will need to make a top-up for this amount
        seqnoA: new BN(0), // initially 0
        seqnoB: new BN(0), // initially 0
    };

    const channelConfig = {
        channelId: new BN(141), // Channel ID, for each new channel there must be a new ID
        addressA: walletAddressA, // A's funds will be withdrawn to this wallet address after the channel is closed
        addressB: walletAddressB, // B's funds will be withdrawn to this wallet address after the channel is closed
        initBalanceA: channelInitState.balanceA,
        initBalanceB: channelInitState.balanceB,
    };

    // Each on their side creates a payment channel object with this configuration
    const channelA = PaymentChannel.create(testClient, {
        ...channelConfig,
        isA: true,
        myKeyPair: keyPairA,
        hisPublicKey: keyPairB.publicKey,
    });

    const channelAddress = channelA.address; // address of this payment channel smart-contract in blockchain
    console.log('channelAddress=', channelAddress.toFriendly());

    const channelB = PaymentChannel.create(testClient, {
        ...channelConfig,
        isA: false,
        myKeyPair: keyPairB,
        hisPublicKey: keyPairA.publicKey,
    });

    if (channelB.address.toFriendly() !== channelAddress.toFriendly()) {
        throw new Error('Channels address not same');
    }

    //----------------------------------------------------------------------
    // DEPLOY PAYMENT CHANNEL FROM WALLET A

    // Wallet A must have a balance.
    // 0.05 TON is the amount to execute this transaction on the blockchain. The unused portion will be returned.
    // After this action, a smart contract of our payment channel will be created in the blockchain.

    // await SendToChannel(testClient, keyPairA.publicKey, keyPairA.secretKey, channelA, toNano(0.05), true);

    // To check you can use blockchain explorer https://testnet.tonscan.org/address/<CHANNEL_ADDRESS>
    // We can also call get methods on the channel (it's free) to get its current data.

    console.log(await channelA.getChannelState());
    const data = await channelA.getData();
    console.log('balanceA = ', data.balanceA.toString());
    console.log('balanceB = ', data.balanceB.toString());

    // TOP UP

    // Now each parties must send their initial balance from the wallet to the channel contract.

    // await SendToChannel(testClient, keyPairA.publicKey, keyPairA.secretKey, channelA, toNano(1 + 0.05), false, createTopUpBalance({
    //     coinsA: toNano(1),
    //     coinsB: toNano(0),
    // }));

    // тут ещё была отправка с B кошелька

    // to check, call the get method - the balances should change

    // INIT

    // After everyone has done top-up, we can initialize the channel from any wallet

    // await SendToChannel(
    //     testClient,
    //     keyPairA.publicKey,
    //     keyPairA.secretKey,
    //     channelA,
    //     toNano(0.05),
    //     false,
    //     await channelA.createInitChannel(channelInitState)
    //         .then((x) => x.cell),
    // );

    // to check, call the get method - `state` should change to `TonWeb.payments.PaymentChannel.STATE_OPEN`

    //----------------------------------------------------------------------
    // FIRST OFFCHAIN TRANSFER - A sends 0.1 TON to B

    // A creates new state - subtracts 0.1 from A's balance, adds 0.1 to B's balance, increases A's seqno by 1

    // const channelState1 = {
    //     balanceA: toNano('0.9'),
    //     balanceB: toNano('0.1'),
    //     seqnoA: new BN(1),
    //     seqnoB: new BN(0),
    // };

    // A signs this state and send signed state to B (e.g. via websocket)

    // const signatureA1 = await channelA.signState(channelState1);

    // B checks that the state is changed according to the rules, signs this state, send signed state to A (e.g. via websocket)

    // if (!(await channelB.verifyState(channelState1, signatureA1))) {
    //     throw new Error('Invalid A signature');
    // }
    // const signatureB1 = await channelB.signState(channelState1);

    //----------------------------------------------------------------------
    // SECOND OFFCHAIN TRANSFER - A sends 0.2 TON to B

    // A creates new state - subtracts 0.2 from A's balance, adds 0.2 to B's balance, increases A's seqno by 1

    // const channelState2 = {
    //     balanceA: toNano('0.7'),
    //     balanceB: toNano('0.3'),
    //     seqnoA: new BN(2),
    //     seqnoB: new BN(0),
    // };

    // A signs this state and send signed state to B (e.g. via websocket)

    // const signatureA2 = await channelA.signState(channelState2);

    // B checks that the state is changed according to the rules, signs this state, send signed state to A (e.g. via websocket)

    // if (!(await channelB.verifyState(channelState2, signatureA2))) {
    //     throw new Error('Invalid A signature');
    // }
    // const signatureB2 = await channelB.signState(channelState2);

    //----------------------------------------------------------------------
    // THIRD OFFCHAIN TRANSFER - B sends 1.1 TON TO A

    // B creates new state - subtracts 1.1 from B's balance, adds 1.1 to A's balance, increases B's seqno by 1

    // const channelState3 = {
    //     balanceA: toNano('0.8'),
    //     balanceB: toNano('0.2'),
    //     seqnoA: new BN(2),
    //     seqnoB: new BN(1),
    // };

    // B signs this state and send signed state to A (e.g. via websocket)

    // const signatureB3 = await channelB.signState(channelState3);

    // A checks that the state is changed according to the rules, signs this state, send signed state to B (e.g. via websocket)

    // if (!(await channelA.verifyState(channelState3, signatureB3))) {
    //     throw new Error('Invalid B signature');
    // }
    // const signatureA3 = await channelA.signState(channelState3);

    //----------------------------------------------------------------------
    // So they can do this endlessly.
    // Note that a party can make its transfers (from itself to another) asynchronously without waiting for the action of the other side.
    // Party must increase its seqno by 1 for each of its transfers and indicate the last seqno and balance of the other party that it knows.

    //----------------------------------------------------------------------
    // CLOSE PAYMENT CHANNEL

    // The parties decide to end the transfer session.
    // If one of the parties disagrees or is not available, then the payment channel can be emergency terminated using the last signed state.
    // That is why the parties send signed states to each other off-chain.
    // But in our case, they do it by mutual agreement.

    // First B signs closing message with last state, B sends it to A (e.g. via websocket)

    // const signatureCloseB = await channelB.signClose(channelState3);

    // A verifies and signs this closing message and include B's signature

    // A sends closing message to blockchain, payments channel smart contract
    // Payment channel smart contract will send funds to participants according to the balances of the sent state.

    // if (!(await channelA.verifyClose(channelState3, signatureCloseB))) {
    //     throw new Error('Invalid B signature');
    // }

    // await SendToChannel(
    //     testClient,
    //     keyPairA.publicKey,
    //     keyPairA.secretKey,
    //     channelA,
    //     toNano(0.05),
    //     false,
    //     await channelA.createCooperativeCloseChannel({
    //         ...channelState3,
    //         hisSignature: signatureCloseB,
    //     })
    //         .then((x) => x.cell),
    // );
};

init();
