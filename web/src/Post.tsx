import React, { ReactNode, useRef, useState } from 'react';
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

export function EditableImagePost(
  { author, title, setTitle, text, setText, image, setImage } :
  {
    author: string,
    title: string, setTitle: (v: string) => void,
    text: string, setText: (v: string) => void,
    image: File | null, setImage: (v: File) => void,
  }
) {
  const [views, _1] = useState(100000 + Math.round(Math.random() * 5000000));
  const [createdAt, _2] = useState(new Date().toLocaleString());
  const [likes, setLikes] = useState(0);
  const [fires, setFires] = useState(0);
  const [brilliants, setBrilliants] = useState(0);

  const imageInput = useRef<HTMLInputElement>(null);

  //const imageUrl = image ?  : ;

return <div className={styles.post}>
    <div className={styles.imageContainer}>

      <div className={styles.replaceableContainer} onClick={() => imageInput.current?.click()}>
        <input ref={imageInput} type="file"
          style={{ display: 'none' }}
          onChange={e => {
            const nextFile = e.target.files?.[0];
            if (nextFile) {
              setImage(nextFile);
            }
          }}
        />

        {image
        ? <img src={URL.createObjectURL(image)} className={styles.image} />
        : <div className={styles.placeholderImageContainer}>
            <img src='/ImagePlaceholder.png' className={styles.placehodlerImage} />
          </div>
        }
        
      </div>
      
      <div className={styles.imageTitle} style={{ minWidth: '150px' }}>
        <div style={{ visibility: 'hidden' }}>
          {title || '-'}
        </div>
        <input type="text" value={title} onChange={e => setTitle(e.target.value)}
          placeholder="Type here ..."
          className={styles.editableTitle}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            padding: '10px',
            background: 'none',
            fontSize: '21px',
            color: 'whitesmoke',
            border: 'none',
            //borderBottom: 'solid 1px white',
          }}
          />
      </div>
      <div className={styles.reactionsContainer}>
        <Reaction emoji='👍' label='Like (0.01 TON)'
          count={likes}
          onClick={() => setLikes(likes + 1)} />
        <Reaction emoji='🔥' label='Fire (0.1 TON)'
          count={fires}
          onClick={() => setFires(fires + 1)} />
        <Reaction emoji='💎' label='Brilliant (1 TON)'
          count={brilliants}
          onClick={() => setBrilliants(brilliants + 1)}  />
      </div>
    </div>

    <div className={styles.postInfo}>
      {views} Views | Posted at {createdAt} by {author}

      <textarea value={text} onChange={e => setText(e.target.value)}
        placeholder="Place for description (optional) ..."
        style={{
          width: '100%',
          padding: '10px',
          marginTop: '10px',
          resize: 'vertical',
          fontFamily: `Calibri, 'Gill Sans', 'Gill Sans MT', 'Trebuchet MS', sans-serif`,
          fontSize: 'large',
        }}
      />
    </div>

  </div>
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
