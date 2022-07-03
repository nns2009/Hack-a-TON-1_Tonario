import { useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';

import styles from './Main.module.scss';
import About from './About';
import Feed from './Feed';
import NotFound from './NotFound';
import Share from './Share';
import API from './API';
import ShareSuccess from './ShareSuccess';
import {RequestContentPlain, SharePlain} from './App';
import Footer from './Footer';
import {PaymentChannel} from "./shared/ton/payments/PaymentChannel";
import {fromNano} from "ton";
import {closePaymentChannel} from "./shared/ton/payments/PaymentChannelUtils";



function RedirectToFeed() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/feed', { replace: true });
  });
  return <div></div>
}


const NavLink = (params: { to: string, title: string }) =>
  <Link to={params.to} className={styles.navLink}>{params.title}</Link>


function Main(params: {
  paymentChannel: PaymentChannel,
  share: SharePlain,
  requestContent: RequestContentPlain,
}) {
  return <div className={styles.page}>
    <header className={styles.header}>
      <img src="/BannerLogoSmall.png" className={styles.bannerLogo} />
      <p style={{color: 'black', fontSize: '15px'}}>{`PaymentChannel balance: ${fromNano(params.paymentChannel.channelState.balanceA)} TON`}</p>
      <p style={{color: 'black', fontSize: '15px', cursor: 'pointer'}} onClick={async () => {await closePaymentChannel(params.paymentChannel)}}>close channel</p>
      <nav className={styles.nav}>
        <NavLink to='/feed' title='Feed' />
        <NavLink to='/share' title='Share' />
        <NavLink to='/about' title='About' />
      </nav>
    </header>

    <Routes>
      <Route path="/" element={<RedirectToFeed />} />
      <Route path="feed" element={<Feed requestContent={params.requestContent} />} />
      <Route path="share" element={<Share share={params.share} /> } />
      <Route path="share/success" element={<ShareSuccess />} />
      <Route path="about" element={<About />} />
      <Route path="*" element={<NotFound />} />
    </Routes>

    <Footer />
  </div>
}

export default Main;
