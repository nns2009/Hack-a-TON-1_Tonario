import React, { useEffect, useState } from 'react';
import { Address } from 'ton';
import FadeLoader from "react-spinners/FadeLoader";
import BN from "bn.js";

import './Global.scss';
import styles from './App.module.scss';
import Welcome from './Welcome';
import Main from './Main';
import {PaymentChannel} from "./shared/ton/payments/PaymentChannel";
import API from './API';
import { useNavigate } from 'react-router-dom';
import {CreatePostResponse, PostInfo, ReactResponse, reactType, RequestContentResponse} from './shared/model';
import {signSendTons} from "./shared/ton/payments/PaymentChannelUtils";
import PRICES from "./shared/PRICES";


export type SetPendingFunction = (nextPending: string | null) => void;

export type StakeCompletedHandler = (paymentChannel: PaymentChannel) => void;

export type RequestContentPlain = (cursor: string | undefined, count: number) => Promise<RequestContentResponse>;
export type SharePlain = (title: string, text: string, image: File | null) => Promise<CreatePostResponse>;
export type ReactPlain = (postId: string, reactionType: reactType) => Promise<ReactResponse>;


const paymentChannelStorageKey = 'paymentChannel';
function savePaymentChannel(paymentChannel: PaymentChannel) {
  localStorage.setItem(
    paymentChannelStorageKey,
    JSON.stringify(paymentChannel.toJSON()),
  );
}
function loadPaymentChannel(): PaymentChannel | null {
  const channelString = localStorage.getItem(paymentChannelStorageKey);
  if (!channelString)
    return null;
  return PaymentChannel.fromJSON(JSON.parse(channelString)); // .parse will likely need "transformer" - second parameter
}

function App() {
  const [pending, setPending] = useState<string | null>(null);
  const [paymentChannel, setPaymentChannel] = useState<PaymentChannel | null>(loadPaymentChannel);

  const navigate = useNavigate();

  function updatePaymentChannel(paymentChannel: PaymentChannel) {
    savePaymentChannel(paymentChannel);
    setPaymentChannel(
      PaymentChannel.fromJSON(
        paymentChannel.toJSON()
      )
    );
  }

  async function share(title: string, text: string, image: File | null): Promise<CreatePostResponse> {
    if (!paymentChannel)
      throw new Error(`Shouldn't be in this state (without paymentChannel) and still requesting new content`);
    try {
      const sign = await signSendTons(paymentChannel, PRICES.CREATE);
      setPending('Sharing ...');
      const res = await API.createPost({
        channelId: paymentChannel.channelId.toString(16),
        signature: sign,
        newChannelState: JSON.stringify(paymentChannel.channelState),
        title, text, image
      });
      navigate('share/success');
      return res;
    } finally {
      setPending(null);
    }
  }

  async function requestContent(cursor: string | undefined, postCount: number): Promise<RequestContentResponse> {
    if (!paymentChannel)
      throw new Error(`Shouldn't be in this state (without paymentChannel) and still requesting new content`);

    const sign = await signSendTons(paymentChannel, PRICES.VIEW.mul(new BN(postCount)));
    updatePaymentChannel(paymentChannel);
    return await API.requestContent({
      channelId: paymentChannel.channelId.toString(16),
      signature: sign,
      newChannelState: JSON.stringify(paymentChannel.channelState),
      postCount,
      cursor,
    });
  }

  async function react(postId: string, reactionType: reactType): Promise<ReactResponse> {
    if (!paymentChannel)
      throw new Error(`Shouldn't be in this state (without paymentChannel) and still trying to react`);

    console.log(`Trying to react to post #${postId} with '${reactionType}'`);
    const sign = await signSendTons(paymentChannel, PRICES.REACT[reactionType]);
    updatePaymentChannel(paymentChannel);

    return await API.react({
      channelId: paymentChannel.channelId.toString(16),
      signature: sign,
      newChannelState: JSON.stringify(paymentChannel.channelState),
      postId,
      reactionType,
    })
  }

  //Hack to test modal backdrop:
  // useEffect(() => {
  //   let lastTime = -1;
  //   function keyPress(e: KeyboardEvent) {
  //     if (Date.now() - lastTime < 100) return;
  //     lastTime = Date.now();
  //     console.log(e.key);
  //     setPending(p => p ? null : 'Test pending info');
  //   }
  //   window.addEventListener('keydown', keyPress);
  //   return () => window.removeEventListener('keydown', keyPress);
  // }, [])

  return (
    <div className={styles.root}>
      <div className={pending ? styles.pending : styles.active}>
        <div className={styles.pendingStatus}>
          {pending}
        </div>
        <FadeLoader loading={pending !== null}
          color="#4cbbeb" />
      </div>
      {/* {myAddress?.toFriendly()} */}
      {
        !paymentChannel
        ? <Welcome stakeCompleted={updatePaymentChannel} setPending={setPending} />
        : <Main paymentChannel={paymentChannel} share={share} react={react} requestContent={requestContent} />
      }
    </div>
  );
}

export default App;
