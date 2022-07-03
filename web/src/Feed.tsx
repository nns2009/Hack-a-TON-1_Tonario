import React, { useEffect, useState } from 'react';

import styles from './Feed.module.scss';
import Post from './Post';
import { PostInfo } from './shared/model';
import { RequestContentPlain } from './App';


const cursorStorageKey = 'feedCursor';
//let ttt = 0;
let lastLoadPostsTime = -1;

function Feed(params: {
  requestContent: RequestContentPlain,
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
  })

  return <div>
    <div className={styles.postSeparator} />
    {posts.map(post =>
      <React.Fragment key={post.id}>
        <Post post={post} />
        <div className={styles.postSeparator} />
      </React.Fragment>
    )}
    <div>End</div>
  </div>
}

export default Feed;
