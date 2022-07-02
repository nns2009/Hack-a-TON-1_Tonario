import { PostInfo } from "./shared/model";
import { Video } from "./UI";

function Post(params: { post: PostInfo }) {
  const { title, text, imageUrl, videoUrl } = params.post;

  return <div>
    {imageUrl && <img src={imageUrl} style={{ width: '100%' }} />}
    {videoUrl && <Video url={videoUrl} />}
    <h1>{title}</h1>
    <div>{text}</div>
  </div>
}

export default Post;
