import styles from './Footer.module.scss';

function Footer() {
  return <div className={styles.bannedLogosContainer}>
    <img src="/BannedLogosSmall.png" className={styles.bannedLogos} />
  </div>;
}

export default Footer;
