import { PostInfo } from "./shared/model";

function Post(params: PostInfo) {
  const { title, text, imageSrc, videoSrc } = params;

  return <div>
    {imageSrc && <img src={imageSrc} />}
    {videoSrc &&
      <iframe width="560" height="315"
        src={videoSrc} title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
    }
    <h1>{title}</h1>
    <div>{text}</div>
  </div>
}

export default Post;
