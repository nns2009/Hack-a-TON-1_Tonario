export type PostInfo = {
  id: string,
  title: string,
  text: string,
  imageUrl: string | null,
  videoUrl: string | null,
  createdAt: string,
  // reactions:
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
  title: string;
  text: string;
}

export type CreatePostResponse = PostInfo;
