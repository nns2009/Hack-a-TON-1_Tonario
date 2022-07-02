import { Address } from "ton";

import styles from './Welcome.module.scss';
import { StakeCompletedHandler } from "./App";
import {openPaymentChannel} from "./shared/ton/payments/PaymentChannelUtils";
import {tonWalletAdapter} from "./shared/ton/ton-wallet/TonWalletWalletAdapter";

async function stake(amount: number, stakeCompleted: StakeCompletedHandler) {
  console.log(`"Staking" ${amount} TONs`); // not Nano-TONs
  const wallet = await tonWalletAdapter.getWallet();
  const channel = await openPaymentChannel(wallet, amount);
  stakeCompleted(
      Address.parse(wallet.address),
      channel,
  );
}


const StakeButton = (
  { amount, stakeCompleted } : {
  amount: number,
  stakeCompleted: StakeCompletedHandler,
}) =>
  <button className={styles.stakeButton}
    onClick={() => stake(amount, stakeCompleted)}>
      {amount} TON
  </button>;


function Welcome(
  { stakeCompleted } :
  { stakeCompleted: StakeCompletedHandler }
) {
  return <div className={styles.welcomePage}>
    <div className={styles.window}>
      <img src="/BannerLogo.png" className={styles.bannerLogo} />
      <p>
        Welcome to OnlyGrams.io! Show your favorite creators your micro-support with micro-payments. Or become a creator and earn yourself a fortune doing what you love.
      </p>
      
      <p>
        Users pay a tiny fee for browsing posts on the website, which goes to creators. Furthermore, reactions (Like, Fire, Brilliant) share extra money to the author of the specific post.
      </p>

      <p>
        Stake some TON and begin!
      </p>

      <div className={styles.stakeButtonGroup}>
        <StakeButton amount={1} stakeCompleted={stakeCompleted} />
        <StakeButton amount={2} stakeCompleted={stakeCompleted} />
        <StakeButton amount={5} stakeCompleted={stakeCompleted} />
        <StakeButton amount={10} stakeCompleted={stakeCompleted} />

      </div>

    </div>

  </div>;
}

export default Welcome;
