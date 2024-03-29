import {
  CloseChannelRequest, CloseChannelResponse,
  CreateChannelRequest,
  CreateChannelResponse, CreatePostRequest,
  InitChannelRequest,
  InitChannelResponse,
  PostInfo,
  ReactRequest,
  ReactResponse,
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



async function createPost(params: CreatePostRequest): Promise<PostInfo> {
  const formData = new FormData();
  formData.append('title', params.title);
  formData.append('text', params.text);
  formData.append('channelId', params.channelId);
  formData.append('newChannelState', params.newChannelState);
  formData.append('signature', params.signature);
  if (params.image)
    formData.append('image', params.image);

  const resp = await fetch(baseUrl + 'create-post', {
    method: 'post',
    body: formData,
  });
  const res = await resp.json();
  return res as PostInfo;
}


const requestContent = (params: RequestContentRequest) =>
  request<RequestContentResponse>('request-content', params);

const react = (params: ReactRequest) =>
  request<ReactResponse>('react', params);

const createChannel = (params: CreateChannelRequest) =>
  request<CreateChannelResponse>('create-channel', params);

const initChannel = (params: InitChannelRequest) =>
  request<InitChannelResponse>('init-channel', params);

const closeChannel = (params: CloseChannelRequest) =>
  request<CloseChannelResponse>('close-channel', params);

export default {
  react,
  createPost,
  requestContent,
  createChannel,
  initChannel,
  closeChannel
};
