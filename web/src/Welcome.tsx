import { BN } from "bn.js";
import { Address } from "ton";
import { StakeCompletedHandler } from "./App";

function stake(amount: number, stakeCompleted: StakeCompletedHandler) {
  console.log(`"Staking" ${amount} TONs`); // not Nano-TONs
  stakeCompleted(
    Address.parse('EQAa_d5RopvY6ZLcQFNJHFmdA8wf_igH-V-5Jc8DRprJIZa-'),
    new BN(amount),
  );
}


const StakeButton = (
  { amount, stakeCompleted } : {
  amount: number,
  stakeCompleted: StakeCompletedHandler,
}) =>
  <button onClick={() => stake(amount, stakeCompleted)}>{amount} TON</button>;


function Welcome(
  { stakeCompleted } :
  { stakeCompleted: StakeCompletedHandler }
) {
  return <div>
    <p>
      Welcome to TonoGram! Show your favorite creators your micro-support with micro-payments. Or become a creator and earn yourself a fortune doing what you love.
    </p>
    
    <p>
      Users pay a tiny fee for browsing posts on the website, which goes to creators. Furthermore, reactions (Like, Fire, Brilliant) share extra money to the author of the specific post.
    </p>

    <p>
      Stake some TON and begin!
    </p>

    <StakeButton amount={1} stakeCompleted={stakeCompleted} />
    <StakeButton amount={2} stakeCompleted={stakeCompleted} />
    <StakeButton amount={5} stakeCompleted={stakeCompleted} />
    <StakeButton amount={10} stakeCompleted={stakeCompleted} />

  </div>;
}

export default Welcome;
