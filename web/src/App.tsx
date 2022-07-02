import React, { useState } from 'react';
import { Address } from 'ton';

import './Global.scss';
import styles from './App.module.scss';
import Welcome from './Welcome';
import Main from './Main';
import {PaymentChannel} from "./shared/ton/payments/PaymentChannel";


export type StakeCompletedHandler = (paymentChannel: PaymentChannel) => void;

const paymentChannelStorageKey = 'paymentChannel';
function savePaymentChannel(paymentChannel: PaymentChannel) {
  localStorage.setItem(
    paymentChannelStorageKey,
    JSON.stringify(paymentChannel),
  );
}
function loadPaymentChannel(): PaymentChannel | null {
  const channelString = localStorage.getItem(paymentChannelStorageKey);
  if (!channelString)
    return null;
  
  return JSON.parse(channelString) as PaymentChannel; // .parse will likely need "transformer" - second parameter
}

function App() {
  const [paymentChannel, setPaymentChannel] = useState<PaymentChannel | null>(loadPaymentChannel);

  function updatePaymentChannel(paymentChannel: PaymentChannel) {
    savePaymentChannel(paymentChannel);
    setPaymentChannel(paymentChannel);
  }

  return (
    <div className={styles.root}>
      {/* {myAddress?.toFriendly()} */}
      {
        !paymentChannel
        ? <Welcome stakeCompleted={updatePaymentChannel} />
        : <div className={styles.page}>
          <Main />
        </div>
      }
    </div>
  );
}

export default App;
