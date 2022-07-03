import { useState } from "react";

import styles from './Share.module.scss';
import Post from "./Post";
import { Field, LineInput, SingleButton, TextareaInput, Video } from "./UI";
import API from "./API";




function Share(
  { share } :
  { share: typeof API.createPost }
) {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [image, setImage]  = useState<File | null>(null);
  //const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');

  // const fl: FileList;
  // const j = fl[0]


  return <div>
    <Field label="Title">
      <LineInput value={title} onChange={setTitle} />
    </Field>
    <Field label="Text">
      <TextareaInput value={text} onChange={setText} />
    </Field>
    <Field label="Image">
      <input type="file" onChange={e => setImage(e.target.files?.[0] ?? null)} />
    </Field>
    {/* <Field label="image URL">
      <LineInput value={imageUrl} onChange={setImageUrl} />
    </Field> */}
    <Field label="YouTube video URL">
      <LineInput value={videoUrl} onChange={setVideoUrl} />
    </Field>

    <h2>Preview</h2>

    <Post post={{
      id: 'new',
      title, text,
      imageUrl: image ? URL.createObjectURL(image) : null,
      videoUrl,
      createdAt: new Date().toISOString(),
      reactions: {},
    }} />

    <div className={styles.shareButtonContainer}>
      <SingleButton label="Post"
        onClick={() => share(title, text, image)}
      />
    </div>
  </div>
}

export default Share;
