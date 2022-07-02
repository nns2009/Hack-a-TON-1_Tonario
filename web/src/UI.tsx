import styles from './UI.module.scss';


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


export const Field = (params: {
  label: string,
  children: React.ReactNode,
}) => <div>
  <div className={styles.fieldLabel}>{params.label}</div>
  {params.children}
</div>
