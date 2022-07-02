

export const LineInput = (
  { value, onChange } :
  {
    value: string,
    onChange: (newValue:string) => void
  }
) =>
  <input type="text"
    value={value}
    onChange={e => onChange(e.target.value)} />;

