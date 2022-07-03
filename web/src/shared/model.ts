import {ChannelState} from "./ton/payments/types";

export type PostInfo = {
  id: string,
  author: string,
  title: string,
  text: string,
  imageUrl: string | null,
  videoUrl: string | null,
  createdAt: string,
  reactions: Record<string, number>;
  views: number;
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

export interface CloseChannelRequest {
  channelId: string;
}

export interface CloseChannelResponse {
  state: {
    balanceA: string;
    balanceB: string;
    seqnoA: string;
    seqnoB: string;
  }
  signature: string;
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
  channelId: string
  newChannelState: string;
  signature: string;
  title: string;
  text: string;
  image: File | null;
}

export type CreatePostResponse = PostInfo;

export type reactType = ("like" | "fire" | "brilliant");

export interface ReactRequest {
  channelId: string
  newChannelState: string;
  signature: string;
  postId: string;
  reactionType: reactType;
}

export interface ReactResponse {
  success: true;
}
