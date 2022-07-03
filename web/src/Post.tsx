import { baseUrl } from './API';
import styles from './Post.module.scss';
import { PostInfo } from "./shared/model";
import { Video } from "./UI";


export function CreditPost(params: { imageUrl: string, title: string, text: string }) {
  const { imageUrl, title, text } = params;

  return <div className={styles.post}>
    <div className={styles.imageContainer}>
      {imageUrl && <img src={imageUrl} className={styles.image} />}
      <div className={styles.imageTitle}>{title}</div>
    </div>

    {/* {videoUrl && <div className={styles.youtubeLinkContainer}>
      <a href={videoUrl} target="_blank" className={styles.youtubeLink}>Watch on YouTube</a>
    </div>} */}
    {text && <div className={styles.text}>{text}</div>}
  </div>
}

function ImagePost(params: { post: PostInfo }) {
  const { title, text, imageUrl, videoUrl } = params.post;

return <>
    <div className={styles.imageContainer}>
      {imageUrl && <img src={imageUrl} className={styles.image} />}
      <div className={styles.imageTitle}>{title}</div>
    </div>

    {videoUrl && <div className={styles.youtubeLinkContainer}>
      <a href={videoUrl} target="_blank" className={styles.youtubeLink}>Watch on YouTube</a>
    </div>}
    {text && <div className={styles.text}>{text}</div>}
  </>
}

function VideoPost(params: { post: PostInfo }) {
  const { title, text, imageUrl, videoUrl } = params.post;

return <>
    {videoUrl && <Video url={videoUrl} />}
    <div className={styles.textTitle}>{title}</div>
    {text && <div className={styles.text}>{text}</div>}
  </>
}

function TextPost(params: { post: PostInfo }) {
  const { title, text, imageUrl, videoUrl } = params.post;

return <>
    <div className={styles.textTitle}>{title}</div>
    {text && <div className={styles.text}>{text}</div>}
  </>
}

function Post(params: { post: PostInfo }) {
  const { title, text, imageUrl, videoUrl } = params.post;
  const PostRenderer =
    imageUrl ? ImagePost :
    videoUrl ? VideoPost :
    TextPost;
  
  return <div className={styles.post}>
    <PostRenderer post={params.post} />
  </div>
}

export default Post;
