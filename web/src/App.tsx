import React, { useState } from 'react';
import { Address } from 'ton';

import './Global.scss';
import styles from './App.module.scss';
import Welcome from './Welcome';
import Main from './Main';
import {PaymentChannel} from "./shared/ton/payments/PaymentChannel";


export type StakeCompletedHandler = (address: Address, channel: PaymentChannel) => void;

function App() {
  const [myAddress, setMyAddress] = useState<Address | null>(null);

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        OnlyGrams.io 
      </header>
      <div className={styles.page}>
        {myAddress?.toFriendly()}
        {
          !myAddress
          ? <Welcome stakeCompleted={ (address, channel) => setMyAddress(address) } />
          : <Main />
        }
      </div>
    </div>
  );
}

export default App;
