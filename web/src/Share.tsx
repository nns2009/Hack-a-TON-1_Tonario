import { useState } from "react";

import Post from "./Post";
import { Field, LineInput, TextareaInput, Video } from "./UI";




function Share() {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [image, setImage]  = useState<File | null>(null);
  //const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');

  // const fl: FileList;
  // const j = fl[0]

  return <div>
    <Field label="title">
      <LineInput value={title} onChange={setTitle} />
    </Field>
    <Field label="text">
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

    <hr />

    <Post post={{
      id: 'new',
      title, text,
      imageUrl: image ? URL.createObjectURL(image) : null,
      videoUrl,
      createdAt: '',
    }} />
  </div>
}

export default Share;
