import {ChannelState} from "./ton/payments/types";

export type PostInfo = {
  id: string,
  title: string,
  text: string,
  imageUrl: string | null,
  videoUrl: string | null,
  createdAt: string,
  reactions: Record<string, number>;
}

export interface CreateChannelRequest {
  clientAddress: string;
  clientPublicKey: string; // In hex.
}

export interface CreateChannelResponse {
  channelId: string;
  clientAddress: string;
  clientPublicKey: string;
  clientCurrentBalance: string;
  clientSeqNo: string;
  serviceAddress: string;
  servicePublicKey: string;
  serviceCurrentBalance: string;
  serviceSeqNo: string;
  initialized: boolean;
}

export interface InitChannelRequest {
  channelId: string;
}

export interface InitChannelResponse {
  success: true;
}

export interface RequestContentRequest {
  channelId: string;
  postCount: number;
  signature: string;
  newChannelState: string;
  cursor?: string;
}

export interface RequestContentResponse {
  posts: PostInfo[];
  next: string | null;
}

/**
 * Note: Endpoint accepts a multipart form with below 2 fields and 1 file "image".
 */
export interface CreatePostRequest {
  // !!! signature: string;
  title: string;
  text: string;
}

export type CreatePostResponse = PostInfo;

export interface ReactRequest {
  channelId: string;
  signature: string;
  postId: string;
  reactionType: 'like' | 'fire' | 'brilliant';
}

export interface ReactResponse {
  success: true;
}
