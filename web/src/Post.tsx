import { PostInfo } from "./shared/model";

function Post(params: PostInfo) {
  const { title, text, imageUrl, videoUrl } = params;

  return <div>
    {imageUrl && <img src={imageUrl} />}
    {videoUrl &&
      <iframe width="560" height="315"
        src={videoUrl} title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
    }
    <h1>{title}</h1>
    <div>{text}</div>
  </div>
}

export default Post;
