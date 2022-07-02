import React, { useState } from 'react';
import { Address } from 'ton';
import styles from './App.module.scss';
import Welcome from './Welcome';
import Main from './Main';


function App() {
  const loginAddress: Address | null = Address.parse('EQAa_d5RopvY6ZLcQFNJHFmdA8wf_igH-V-5Jc8DRprJIZa-');

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        TonoGram
      </header>
      {
        !loginAddress
        ? <Welcome />
        : <Main />
      }
    </div>
  );
}

export default App;
