import {Address, Cell, CellMessage, CommonMessageInfo, ExternalMessage, TonClient} from 'ton';
import { TON_WALLET_EXTENSION_URL, TonWalletClient } from './TonWalletClient';
import { Wallet } from './types/Wallet';
import { WalletAdapter } from './types/WalletAdapter';
import { timeout } from './types/utils';
import {tonClient} from "../index";
import {Buffer} from "buffer";

export function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export class TonWalletWalletAdapter implements WalletAdapter<boolean> {

  constructor(
    private readonly tonClient: TonClient,
    private readonly tonWalletClient: TonWalletClient,
  ) {
  }

  async createSession(): Promise<boolean> {
    try {
      await this.tonWalletClient.ready(150);
      return true;
    } catch (error) {
      window.open(TON_WALLET_EXTENSION_URL, '_blank');
      throw error;
    }
  }

  async awaitReadiness(): Promise<Wallet> {
    await this.tonWalletClient.ready();

    const [[wallet]] = await Promise.all([
      this.tonWalletClient.requestWallets(),
      delay(150),
    ]);

    if (!wallet) {
      throw new Error('TON Wallet is not configured.');
    }

    return wallet;
  }

  getWallet(): Promise<Wallet> {
    return this.awaitReadiness();
  }

  isAvailable(): boolean {
    return !!window.ton?.isTonWallet;
  }



  async requestCustomTransfer(
      customBody: Cell
  ) {
    const hexToBuffer = (hex: string): Buffer => {
      if (hex.length % 2 !== 0) hex = `0${hex}`;
      return Buffer.from(hex, 'hex');
    };
    const wallet = await this.getWallet();
    const ownerAddress = Address.parse(wallet.address);

    const sign = await Promise.race([
      this.tonWalletClient.sign(customBody.hash().toString('hex')),
      timeout(60000, 'Sign request exceeded timeout.'),
    ]);
    console.log('checkpoint', customBody.hash().toString('hex'), sign);
    const signedBody = new Cell();
    signedBody.bits.writeBuffer(hexToBuffer(sign as string))
    signedBody.writeCell(customBody)

    const message = new ExternalMessage({
      to: ownerAddress,
      body: new CommonMessageInfo({
        stateInit: undefined,
        body: new CellMessage(signedBody)
      })
    });
    await tonClient.sendMessage(message)
  }
}

export const tonWalletAdapter = new TonWalletWalletAdapter(tonClient, new TonWalletClient(window))
