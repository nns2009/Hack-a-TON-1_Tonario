import React, { useEffect, useState } from 'react';

import commonStyles from './Common.module.scss';
import styles from './Feed.module.scss';
import Post from './Post';
import { PostInfo, reactType } from './shared/model';
import { ReactPlain, RequestContentPlain } from './App';
import { Button, SingleButton } from './UI';


const cursorStorageKey = 'feedCursor';
//let ttt = 0;
let lastLoadPostsTime = -1;

function Feed(params: {
  requestContent: RequestContentPlain,
  react: ReactPlain,
}) {
  const [showRecentPostsButton, setShowRecentPostsButton] = useState(false);
  const [cursor, setCursor] = useState<string | undefined | null>(
    () => localStorage.getItem(cursorStorageKey) ?? undefined);
  const [posts, setPosts] = useState<PostInfo[]>([]);


  async function loadPosts(cursor: string | undefined) {
    lastLoadPostsTime = Date.now();

    const res = await params.requestContent(cursor, 8);
    if (res.next)
      localStorage.setItem(cursorStorageKey, res.next);
    else
      localStorage.removeItem(cursorStorageKey);
    setCursor(res.next);

    if ('error' in res) throw new Error(JSON.stringify(res));
    return res.posts;
  }
  async function loadAndAppendPosts() {
    if (cursor === null) return;
    const loadedPosts = await loadPosts(cursor);
    setPosts(ps => [...ps, ...loadedPosts]);
  }
  async function loadRecentAndRefresh() {
    const loadedPosts = await loadPosts(undefined);
    window.scrollTo(0, 0);
    setPosts(loadedPosts);
  }

  useEffect(() => { loadAndAppendPosts(); }, []);


  //ttt++;
  function onScroll() {
    if (window.scrollY >= 5000 && !showRecentPostsButton) {
      setShowRecentPostsButton(true);
    } else if (window.scrollY <= 4000 && showRecentPostsButton) {
      setShowRecentPostsButton(false);
    }

    if (Date.now() - lastLoadPostsTime <= 2500) {
      // ^ Wait at least a few seconds before requesting more posts
      //console.log(`Preventing request`, Date.now() - lastLoadPostsTime);
      return;
    }
    //console.log(ttt, window.scrollY, window.innerHeight);
    if(window.scrollY + window.innerHeight
      + 1200 // Load posts beforehand
      >= 
      document.documentElement.scrollHeight) {
      loadAndAppendPosts();
    }
  }

  useEffect(() => {
    window.addEventListener('scroll', onScroll);
    return () => { window.removeEventListener('scroll', onScroll); };
  });

  async function reactAndUpdateCount(postId: string, reactionType: reactType) {
    const res = await params.react(postId, reactionType);

    if (res.success) {
      setPosts(ps =>
        ps.map(p =>
          p.id !== postId
          ? p
          : ({
            ...p,
            reactions: {
              ...p.reactions,
              [reactionType]: res.reactionCount,
            }
          })
        )
      );
    }

    return res;
  }

  return <div>
    <div className={
      showRecentPostsButton ? styles.jumpToRecentVisible : styles.jumpToRecentHidden
      // styles.jumpToRecent + ' ' + commonStyles.hidable + ' '
      // + (posts.length <= 14 ? commonStyles.hidden : commonStyles.visible)
    } onClick={loadRecentAndRefresh}>
      Go to recent posts
    </div>

    <div className={styles.postSeparator} />
    {posts.map(post =>
      <React.Fragment key={post.id}>
        <Post post={post} react={reactAndUpdateCount} />
        <div className={styles.postSeparator} />
      </React.Fragment>
    )}

    {cursor === null &&
    <div className={styles.feedEnd}>
      <p>
        You've reached the end of feed
      </p>
      <SingleButton label='Jump to recent posts' onClick={loadRecentAndRefresh} />
    </div>}

    {posts.length === 0 &&
    <div>Insufficient balance. Need to open new payment channel.</div>}
  </div>
}

export default Feed;
