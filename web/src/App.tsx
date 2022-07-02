import React, { useState } from 'react';
import { BocCode } from './BocCode';
import logo from './logo.svg';
import styles from './App.module.scss';

function App() {
  const apiUrl = process.env.REACT_APP_API_URL;

  const [randomNumber] = useState(Math.ceil(Math.random() * 0xffffffff));

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <img src={logo} className={styles.logo} alt="logo" />
        <p>
          Bag-of-Cells: <BocCode value={randomNumber} />
        </p>
        <p>
          API: <a className={styles.link} href={apiUrl}>{apiUrl}</a>
        </p>
      </header>
    </div>
  );
}

export default App;
