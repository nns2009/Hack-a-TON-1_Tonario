import { Wallet } from './Wallet';

export interface WalletAdapter<S> {
  isAvailable(): boolean;
  createSession(): Promise<S>;
  awaitReadiness(session: S): Promise<Wallet>;
  getWallet(session: S): Promise<Wallet>;
}
