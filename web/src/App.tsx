import React, { useState } from 'react';
import { Address } from 'ton';
import FadeLoader from "react-spinners/FadeLoader";

import './Global.scss';
import styles from './App.module.scss';
import Welcome from './Welcome';
import Main from './Main';
import {PaymentChannel} from "./shared/ton/payments/PaymentChannel";
import API from './API';
import { useNavigate } from 'react-router-dom';
import { RequestContentResponse } from './shared/model';


export type StakeCompletedHandler = (paymentChannel: PaymentChannel) => void;

export type RequestContentPlain = (cursor: string | undefined, count: number) => Promise<RequestContentResponse>;

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
  const [pending, setPending] = useState(false);
  const [paymentChannel, setPaymentChannel] = useState<PaymentChannel | null>(loadPaymentChannel);

  const navigate = useNavigate();

  function updatePaymentChannel(paymentChannel: PaymentChannel) {
    savePaymentChannel(paymentChannel);
    setPaymentChannel(paymentChannel);
  }

  async function share(title: string, text: string, image: File | null) {
    // !!! Add signatures, micro-payment, author info
    try {
      setPending(true);
      const res = await API.createPost(title, text, image);
      navigate('share/success');
      return res;
    } finally {
      setPending(false);
    }
  }

  async function requestContent(cursor: string | undefined, postCount: number): Promise<RequestContentResponse> {
    if (!paymentChannel)
      throw new Error(`Shouldn't be in this state (without paymentChannel) and still requesting new content`);

    return await API.requestContent({
      channelId: paymentChannel.channelId.toString(),
      signature: 'muha', // !!!!
      postCount,
      cursor,
    });
  }

  return (
    <div className={styles.root}>
      <div className={pending ? styles.pending : styles.active}>
        <FadeLoader loading={pending}
          color="#4cbbeb" />
      </div>
      {/* {myAddress?.toFriendly()} */}
      {
        !paymentChannel
        ? <Welcome stakeCompleted={updatePaymentChannel} />
        : <div className={styles.page}>
          <Main share={share} requestContent={requestContent} />
        </div>
      }
    </div>
  );
}

export default App;
