import { Address } from "ton";

import styles from './Welcome.module.scss';
import { SetPendingFunction, StakeCompletedHandler } from "./App";
import {openPaymentChannel} from "./shared/ton/payments/PaymentChannelUtils";
import {tonWalletAdapter} from "./shared/ton/ton-wallet/TonWalletWalletAdapter";
import { Button, ButtonGroup } from "./UI";
import Footer from "./Footer";

async function stake(
  amount: number,
  stakeCompleted: StakeCompletedHandler,
  setPending: SetPendingFunction
) {
  console.log(`"Staking" ${amount} TONs`); // not Nano-TONs
  //stakeCompleted({} as any); return;
  const wallet = await tonWalletAdapter.getWallet();
  const channel = await openPaymentChannel(wallet, amount, setPending);
  stakeCompleted(
      //Address.parse(wallet.address),
      channel,
  );
}


const StakeButton = (
  { amount, stakeCompleted, setPending } : {
  amount: number,
  stakeCompleted: StakeCompletedHandler,
  setPending: SetPendingFunction,
}) =>
  <Button label={amount + ' TON'}
    onClick={() => stake(amount, stakeCompleted, setPending)} />


function Welcome(
  { stakeCompleted, setPending } :
  { stakeCompleted: StakeCompletedHandler, setPending: SetPendingFunction }
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

      <ButtonGroup>
        <StakeButton amount={0.1} stakeCompleted={stakeCompleted} setPending={setPending} />
        {/* !!! Remove ^ */}
        <StakeButton amount={1} stakeCompleted={stakeCompleted} setPending={setPending} />
        <StakeButton amount={2} stakeCompleted={stakeCompleted} setPending={setPending} />
        <StakeButton amount={5} stakeCompleted={stakeCompleted} setPending={setPending} />
        <StakeButton amount={10} stakeCompleted={stakeCompleted} setPending={setPending} />
      </ButtonGroup>

      <p>You'll need to wait for about 15 seconds after signing the transaction for payment channel to open. It will take you to the next page automatically.</p>
    </div>

    <Footer />
  </div>;
}

export default Welcome;
