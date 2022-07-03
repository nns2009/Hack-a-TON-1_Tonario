import styles from './UI.module.scss';


export const Button = (
  { label, onClick, disabled } :
  {
    label: string,
    onClick: () => void,
    disabled?: boolean,
  },
) => <button className={styles.button}
  onClick={onClick}
  disabled={disabled}
>
  {label}
</button>;

export const ButtonGroup = (
  { children, disabled } :
  { children: React.ReactNode, disabled?: boolean },
) => <div
className={styles.buttonGroup}
  style={disabled ? { filter: 'grayscale(1)' } : {}}
>
  {children}
</div>

export const SingleButton = (
  { label, onClick, disabled } :
  {
    label: string,
    onClick: () => void,
    disabled?: boolean,
  },
) => <ButtonGroup disabled={disabled}>
  <Button label={label} onClick={onClick} disabled={disabled} />
</ButtonGroup>;


export const LineInput = (
  { value, onChange } :
  {
    value: string,
    onChange: (newValue:string) => void
  }
) =>
  <input type="text" className={styles.lineInput}
    value={value}
    onChange={e => onChange(e.target.value)} />;


export const TextareaInput = (
  { value, onChange } :
  {
    value: string,
    onChange: (newValue:string) => void
  }
) =>
  <textarea className={styles.textarea}
    value={value}
    onChange={e => onChange(e.target.value)} />;
    

export const Video = (
  { url } :
  { url: string },
) => {
  let videoId;

  const fullMatch = url.match(/youtube\.com\/watch\?v=(\w+)/);
  if (fullMatch) videoId = fullMatch[1];
  else {
    const shortMatch = url.match(/youtu\.be\/(\w+)/);
    if (shortMatch) videoId = shortMatch[1];
    else videoId = null;
  }

  if (videoId === null)
    return <div>Wrong video URL</div>

  const embedUrl = `https://www.youtube.com/embed/${videoId}`;

  return <iframe width="560" height="315"
    src={embedUrl} title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />;
}


export const Field = (params: {
  label: string,
  children: React.ReactNode,
}) => <div>
  <div className={styles.fieldLabel}>{params.label}</div>
  {params.children}
</div>
