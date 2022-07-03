import { baseUrl } from './API';
import { ReactPlain } from './App';
import styles from './Post.module.scss';
import { PostInfo } from "./shared/model";
import { Video } from "./UI";


export function CreditPost(params: { imageUrl: string, title: string, text: string }) {
  const { imageUrl, title, text } = params;

  return <div className={styles.post + ' ' + styles.equal}>
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

function Reaction(
  { count, emoji, label, onClick } : {
    count: number,
    emoji: string,
    label: string,
    onClick: () => void,
  }) {
  return <div className={styles.reaction} title={label} onClick={onClick}>
    {count} {emoji}
  </div>
}

function ImagePost(params: { post: PostInfo, react: ReactPlain | null }) {
  const { post, react } = params;
  const { id, title, text, imageUrl, videoUrl, createdAt, views, author, reactions } = post;

return <>
    <div className={styles.imageContainer}>
      {imageUrl && <img src={imageUrl} className={styles.image} />}
      <div className={styles.imageTitle}>{title}</div>
      <div className={styles.reactionsContainer}>
        <Reaction emoji='👍' label='Like (0.01 TON)'
          count={reactions.like ?? 0}
          onClick={() => react && react(id, 'like')} />
        <Reaction emoji='🔥' label='Fire (0.1 TON)'
          count={reactions.fire ?? 0}
          onClick={() => react && react(id, 'fire')} />
        <Reaction emoji='💎' label='Brilliant (1 TON)'
          count={reactions.brilliant ?? 0}
          onClick={() => react && react(id, 'brilliant')}  />
      </div>
    </div>

    {videoUrl && <div className={styles.youtubeLinkContainer}>
      <a href={videoUrl} target="_blank" className={styles.youtubeLink}>Watch on YouTube</a>
    </div>}

    <div className={styles.postInfo}>
      {views} Views | Posted at {new Date(createdAt).toLocaleString()} by {author}
    </div>

    {text && <div className={styles.text}>{text}</div>}
  </>
}

function VideoPost(params: { post: PostInfo, react: ReactPlain | null }) {
  const { title, text, imageUrl, videoUrl } = params.post;

return <>
    {videoUrl && <Video url={videoUrl} />}
    <div className={styles.textTitle}>{title}</div>
    {text && <div className={styles.text}>{text}</div>}
  </>
}

function TextPost(params: { post: PostInfo, react: ReactPlain | null }) {
  const { title, text, imageUrl, videoUrl } = params.post;

return <>
    <div className={styles.textTitle}>{title}</div>
    {text && <div className={styles.text}>{text}</div>}
  </>
}

function Post(params: { post: PostInfo, react: ReactPlain | null }) {
  const { title, text, imageUrl, videoUrl } = params.post;
  const PostRenderer =
    imageUrl ? ImagePost :
    videoUrl ? VideoPost :
    TextPost;
  
  return <div className={styles.post}>
    <PostRenderer post={params.post} react={params.react} />
  </div>
}

export default Post;
