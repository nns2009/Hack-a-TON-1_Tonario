import { useState } from "react";
import { Address } from "ton";

import styles from './Share.module.scss';
import Post, { EditableImagePost } from "./Post";
import { Field, LineInput, SingleButton, TextareaInput, Video } from "./UI";
import {SharePlain} from "./App";




function Share(
  { share, myAddress } :
  { share: SharePlain, myAddress: Address }
) {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [image, setImage]  = useState<File | null>(null);
  //const [imageUrl, setImageUrl] = useState('');
  //const [videoUrl, setVideoUrl] = useState('');


  return <div>
    {/* <Field label="Title">
      <LineInput value={title} onChange={setTitle} />
    </Field>
    <Field label="Text">
      <TextareaInput value={text} onChange={setText} />
    </Field>
    <Field label="Image">
      <input type="file" onChange={e => setImage(e.target.files?.[0] ?? null)} />
    </Field> */}
    {/* <Field label="image URL">
      <LineInput value={imageUrl} onChange={setImageUrl} />
    </Field> 
    <Field label="YouTube video URL">
      <LineInput value={videoUrl} onChange={setVideoUrl} />
    </Field> */}
    <div style={{ height: '20px' }} />

    <EditableImagePost
      author={myAddress.toFriendly()}
      title={title} setTitle={setTitle}
      text={text} setText={setText}
      image={image} setImage={setImage}
    />

    <div className={styles.shareButtonContainer}>
      <SingleButton label="Post"
        onClick={() => share(title, text, image)}
      />
    </div>
  </div>
}

export default Share;
