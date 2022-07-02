import { Wallet } from './Wallet';
import {PaymentChannel} from "../../payments/PaymentChannel";

export interface WalletState {
  wallet: Wallet | null;
  paymentChannel: PaymentChannel | null;
}
