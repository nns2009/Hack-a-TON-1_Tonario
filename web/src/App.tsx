import React, { useState } from 'react';
import styles from './App.module.scss';


function App() {
  const [randomNumber] = useState(Math.ceil(Math.random() * 0xffffffff));

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        TonoGram
      </header>
    </div>
  );
}

export default App;
