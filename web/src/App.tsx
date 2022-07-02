import React, { useState } from 'react';
import { Address } from 'ton';
import styles from './App.module.scss';
import Welcome from './Welcome';
import Main from './Main';
import BN from 'bn.js';


export type StakeCompletedHandler = (address: Address, amount: BN) => void;

function App() {
  const [myAddress, setMyAddress] = useState<Address | null>(null);

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        TonoGram 
      </header>
      {myAddress?.toFriendly()}
      {
        !myAddress
        ? <Welcome stakeCompleted={ (address, amount) => setMyAddress(address) } />
        : <Main />
      }
    </div>
  );
}

export default App;
