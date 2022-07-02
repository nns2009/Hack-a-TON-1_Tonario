import { useState } from "react";

import { Field, LineInput } from "./UI";




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
      <LineInput value={text} onChange={() => {}} />
    </Field>
  </div>
}

export default Share;
