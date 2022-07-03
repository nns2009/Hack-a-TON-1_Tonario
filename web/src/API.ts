import {
  CreateChannelRequest,
  CreateChannelResponse,
  InitChannelRequest,
  InitChannelResponse,
  PostInfo
} from "./shared/model";


export const baseUrl = 'https://api.onlygrams.io/'; // 'http://localhost:3200/';

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
const requestContent = (postCount: number) =>
  request<PostInfo[]>('request-content', { postCount });


async function createPost(title: string, text: string, image: File | null): Promise<PostInfo> {
  const formData = new FormData();
  formData.append('title', title);
  formData.append('text', text);
  if (image)
    formData.append('image', image);
  //formData.append('testParam', 'testValue');

  const resp = await fetch(baseUrl + 'create-post', {
    method: 'post',
    body: formData,
  });
  const res = await resp.json();
  return res as PostInfo;
}

const createChannel = (params: CreateChannelRequest) =>
  request<CreateChannelResponse>('create-channel', params);


const initChannel = (params: InitChannelRequest) =>
  request<InitChannelResponse>('init-channel', params);


export default {
  // react,
  // createChannel,
  // initChannel,
  createPost,
  requestContent,
  createChannel,
  initChannel,
};
