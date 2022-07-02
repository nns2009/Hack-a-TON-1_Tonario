import React, { useMemo } from 'react';
import { Cell } from 'ton';

interface BocCodeProps {
  value: number;
}

export function BocCode({ value }: BocCodeProps) {
  const boc = useMemo(
    () => {
      const cell = new Cell();
      cell.bits.writeUint(value, 32);
      return cell.toBoc().toString('base64');
    },
    [value],
  );

  return (
    <code>{boc}</code>
  );
}
