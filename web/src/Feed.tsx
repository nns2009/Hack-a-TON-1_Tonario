import { useEffect, useState } from 'react';

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
    {posts.map(post => <Post key={post.id} post={post} />)}
  </div>
}

export default Feed;
