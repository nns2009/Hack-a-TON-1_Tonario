import { PostInfo } from "./shared/model";


const baseUrl = 'http://localhost:3200/';

async function request<T>(method: string, params: object): Promise<T> {
  const resp = await fetch(baseUrl + method, {
    method: 'POST',
    body: JSON.stringify(params),
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    },
  });
  const res = await resp.json();
  return res as T;
}


// const react = requester('react');
// const createChannel = requester('create-channel');
// const initChannel = requester('init-channel');
// const createPost = requester('create-post');
const requestContent = (postCount: number) =>
  request<PostInfo[]>('request-content', { postCount });

export default {
  // react,
  // createChannel,
  // initChannel,
  // createPost,
  requestContent,
};
