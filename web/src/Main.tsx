import { useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';

import styles from './Main.module.scss';
import About from './About';
import Feed from './Feed';
import NotFound from './NotFound';
import Share from './Share';
import API from './API';
import ShareSuccess from './ShareSuccess';
import {ReactPlain, RequestContentPlain, SharePlain} from './App';
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
  <Link to={params.to} className={styles.navAction}>{params.title}</Link>


function Main(params: {
  paymentChannel: PaymentChannel,
  share: SharePlain,
  requestContent: RequestContentPlain,
  react: ReactPlain,
}) {
  return <div className={styles.page}>
    <header className={styles.header}>
      <img src="/BannerLogoSmall.png" className={styles.bannerLogo} />
      <div className={styles.navInfo} title='Balance available in your payment channel'>
        {fromNano(params.paymentChannel.channelState.balanceA)} TON
      </div>
      <nav className={styles.nav}>
        <NavLink to='/feed' title='Feed' />
        <NavLink to='/share' title='Share' />
        <NavLink to='/about' title='About' />
        <div className={styles.navAction}
          title="Close payment channel and unlog from the website"
          onClick={ async () => {await closePaymentChannel(params.paymentChannel)} }
        >
          Leave
        </div>
      </nav>
    </header>

    <Routes>
      <Route path="/" element={<RedirectToFeed />} />
      <Route path="feed" element={<Feed requestContent={params.requestContent} react={params.react} />} />
      <Route path="share" element={
        <Share share={params.share} myAddress={params.paymentChannel.addressA} />
      } />
      <Route path="share/success" element={<ShareSuccess />} />
      <Route path="about" element={<About />} />
      <Route path="*" element={<NotFound />} />
    </Routes>

    <Footer />
  </div>
}

export default Main;
