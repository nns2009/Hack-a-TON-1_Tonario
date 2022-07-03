import React, { useEffect, useState } from 'react';

import styles from './Feed.module.scss';
import API from './API';
import Post from './Post';
import { PostInfo } from './shared/model';
import { RequestContentPlain } from './App';


const cursorStorageKey = 'feedCursor';

function Feed(params: {
  requestContent: RequestContentPlain,
}) {
  const [cursor, setCursor] = useState(
    () => localStorage.getItem(cursorStorageKey) ?? undefined);
  const [posts, setPosts] = useState<PostInfo[]>([]);

  async function loadPosts() {
    const res = await params.requestContent(cursor, 5);
    if (res.next)
      localStorage.setItem(cursorStorageKey, res.next);
    else
      localStorage.removeItem(cursorStorageKey);
    setCursor(res.next ?? undefined);
    
    if (!('error' in res))
      setPosts([...posts, ...res.posts]);
  }

  useEffect(() => { loadPosts(); }, []);

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
