import {Buffer} from "buffer";

export const hexToBuffer = (hex: string): Buffer => {
      if (hex.length % 2 !== 0) hex = `0${hex}`;
      return Buffer.from(hex, 'hex');
    };
