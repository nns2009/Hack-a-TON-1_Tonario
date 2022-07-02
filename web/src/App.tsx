import React, { useMemo, useState } from 'react';
import { Cell } from 'ton';
import logo from './logo.svg';
import styles from './App.module.scss';

function App() {
  const [n] = useState(0xff00ff00);
  const boc = useMemo(
    () => {
      const cell = new Cell();
      cell.bits.writeUint(n, 32);
      return cell.toBoc().toString('base64');
    },
    [n],
  );

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <img src={logo} className={styles.logo} alt="logo" />
        <p>
          Bag-of-Cells: <code>{ boc}</code>
        </p>
      </header>
    </div>
  );
}

export default App;
