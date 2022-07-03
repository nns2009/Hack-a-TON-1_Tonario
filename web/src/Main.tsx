import { useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';

import styles from './Main.module.scss';
import About from './About';
import Feed from './Feed';
import NotFound from './NotFound';
import Share from './Share';
import API from './API';
import ShareSuccess from './ShareSuccess';



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
  share: typeof API.createPost,
}) {
  return <div>
    <header className={styles.header}>
      <img src="/BannerLogoSmall.png" className={styles.bannerLogo} />
      <nav className={styles.nav}>
        <NavLink to='/feed' title='Feed' />
        <NavLink to='/share' title='Share' />
        <NavLink to='/about' title='About' />
      </nav>
    </header>

    <Routes>
      <Route path="/" element={<RedirectToFeed />} />
      <Route path="feed" element={<Feed />} />
      <Route path="share" element={<Share share={params.share} /> } />
      <Route path="share/success" element={<ShareSuccess />} />
      <Route path="about" element={<About />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </div> 
}

export default Main;
