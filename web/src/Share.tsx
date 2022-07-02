import { useState } from "react";

import { Field, LineInput, Video } from "./UI";




function Share() {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');

  return <div>
    <Field label="title">
      <LineInput value={title} onChange={setTitle} />
    </Field>
    <Field label="text">
      <LineInput value={text} onChange={setText} />
    </Field>
    <Field label="image URL">
      <LineInput value={imageUrl} onChange={setImageUrl} />
    </Field>
    <img src={imageUrl} />
    <hr />
    <Field label="YouTube video URL">
      <LineInput value={videoUrl} onChange={setVideoUrl} />
    </Field>
    {videoUrl.search(/youtu/i) >= 0 && <Video url={videoUrl} />}

  </div>
}

export default Share;
