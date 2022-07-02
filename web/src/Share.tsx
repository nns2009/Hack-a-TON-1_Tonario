import { useState } from "react";

import { LineInput } from "./UI";

function Share() {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');

  return <div>
    <LineInput value={title} onChange={setTitle} />
    <LineInput value={text} onChange={() => {}} />
  </div>
}

export default Share;
