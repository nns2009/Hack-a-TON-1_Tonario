import {
  CreateChannelRequest,
  CreateChannelResponse,
  InitChannelRequest,
  InitChannelResponse,
  PostInfo
} from "./shared/model";


export const baseUrl = 'http://localhost:3200/';

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


const createChannel = (params: CreateChannelRequest) =>
    request<CreateChannelResponse>('create-channel', params);


const initChannel = (params: InitChannelRequest) =>
    request<InitChannelResponse>('init-channel', params);


export default {
  // react,
  // createChannel,
  // initChannel,
  // createPost,
  requestContent,
  createChannel,
  initChannel,
};
