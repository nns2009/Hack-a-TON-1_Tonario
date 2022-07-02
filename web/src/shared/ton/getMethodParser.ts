import { Cell } from 'ton';
import { Buffer } from 'buffer';
import BN from "bn.js";

export default class GetMethodParser {
    static parseObject(x: any): any {
        const typeName = x['@type'];
        switch (typeName) {
        case 'tvm.list':
        case 'tvm.tuple':
            return x.elements.map(GetMethodParser.parseObject);
        case 'tvm.cell':
            return Cell.fromBoc(Buffer.from(x.bytes, 'base64'))[0];
        case 'tvm.stackEntryCell':
            return GetMethodParser.parseObject(x.cell);
        case 'tvm.stackEntryTuple':
            return GetMethodParser.parseObject(x.tuple);
        case 'tvm.stackEntryNumber':
            return GetMethodParser.parseObject(x.number);
        case 'tvm.numberDecimal':
            return new BN(x.number, 10);
        default:
            throw new Error(`unknown type ${typeName}`);
        }
    }

    /**
     * @param pair  {any[]}
     * @return {any}
     */
    static parseResponseStack(pair: any[]): any {
        const typeName = pair[0];
        const value = pair[1];

        switch (typeName) {
        case 'num':
            return new BN(value.replace(/^0x/, ''), 16);
        case 'list':
        case 'tuple':
            return GetMethodParser.parseObject(value);
        case 'cell':
            return Cell.fromBoc(Buffer.from(value.bytes, 'base64'))[0];
        default:
            throw new Error(`unknown type ${typeName}`);
        }
    }

    static parseStack(stack: any) {
        const arr = stack.map(GetMethodParser.parseResponseStack);
        return arr.length === 1 ? arr[0] : arr;
    }

    static makeArg(arg: any) {
        if (arg instanceof BN || arg instanceof Number) {
            return ['num', arg];
        }
        throw new Error(`unknown arg type ${arg}`);
    }

    static makeArgs(args: any) {
        return args.map(this.makeArg);
    }
}
