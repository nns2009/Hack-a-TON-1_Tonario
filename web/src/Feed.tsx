import React, { useEffect, useState } from 'react';

import styles from './Feed.module.scss';
import API from './API';
import Post from './Post';
import { PostInfo } from './shared/model';


function Feed() {
  const [posts, setPosts] = useState<PostInfo[]>([]);

  async function loadPosts() {
    const nextPosts = await API.requestContent(4);
    setPosts(nextPosts);
  }

  useEffect(() => { loadPosts(); }, []);

  return <div>
    <div className={styles.postSeparator} />
    {posts.map(post => <React.Fragment key={post.id}>
      <Post post={post} />
      <div className={styles.postSeparator} />
    </React.Fragment>)}
  </div>
}

export default Feed;
