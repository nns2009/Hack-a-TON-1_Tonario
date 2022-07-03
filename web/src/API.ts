import {
  CreateChannelRequest,
  CreateChannelResponse,
  InitChannelRequest,
  InitChannelResponse,
  PostInfo,
  RequestContentRequest,
  RequestContentResponse
} from "./shared/model";

export const baseUrl = process.env.REACT_APP_API_URL + '/';

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



async function createPost(title: string, text: string, image: File | null): Promise<PostInfo> {
  const formData = new FormData();
  formData.append('title', title);
  formData.append('text', text);
  if (image)
    formData.append('image', image);

  const resp = await fetch(baseUrl + 'create-post', {
    method: 'post',
    body: formData,
  });
  const res = await resp.json();
  return res as PostInfo;
}

// const react = requester('react');

const requestContent = (params: RequestContentRequest) =>
  request<RequestContentResponse>('request-content', params);

const createChannel = (params: CreateChannelRequest) =>
  request<CreateChannelResponse>('create-channel', params);

const initChannel = (params: InitChannelRequest) =>
  request<InitChannelResponse>('init-channel', params);


export default {
  // react,
  createPost,
  requestContent,
  createChannel,
  initChannel,
};
