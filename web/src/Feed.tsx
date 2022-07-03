import React, { useEffect, useState } from 'react';

import styles from './Feed.module.scss';
import Post from './Post';
import { PostInfo, reactType } from './shared/model';
import { ReactPlain, RequestContentPlain } from './App';


const cursorStorageKey = 'feedCursor';
//let ttt = 0;
let lastLoadPostsTime = -1;

function Feed(params: {
  requestContent: RequestContentPlain,
  react: ReactPlain,
}) {
  const [cursor, setCursor] = useState(
    () => localStorage.getItem(cursorStorageKey) ?? undefined);
  const [posts, setPosts] = useState<PostInfo[]>([]);



  async function loadPosts() {
    lastLoadPostsTime = Date.now();

    const res = await params.requestContent(cursor, 8);
    if (res.next)
      localStorage.setItem(cursorStorageKey, res.next);
    else
      localStorage.removeItem(cursorStorageKey);
    setCursor(res.next ?? undefined);

    if (!('error' in res))
      setPosts([...posts, ...res.posts]);
  }

  useEffect(() => { loadPosts(); }, []);

  //ttt++;
  function onScroll() {
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
      loadPosts();
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
    <div className={styles.postSeparator} />
    {posts.map(post =>
      <React.Fragment key={post.id}>
        <Post post={post} react={reactAndUpdateCount} />
        <div className={styles.postSeparator} />
      </React.Fragment>
    )}
    {posts.length === 0 ? (<div>Insufficient balance. Need to open new payment channel.</div>) : (<div>End</div>)}
  </div>
}

export default Feed;
