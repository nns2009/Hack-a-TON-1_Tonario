import {
    Address, Cell, ConfigStore, ContractSource,
} from 'ton';
import BN from "bn.js";
import { Buffer } from 'buffer';
import { ClosingConfig } from '../types';
import { writePublicKey } from '../PaymentUtils';

const PAYMENT_CHANNEL_CODE_HEX = 'B5EE9C72410230010007FB000114FF00F4A413F4BCF2C80B0102012002030201480405000AF26C21F0190202CB06070201202E2F020120080902012016170201200A0B0201200C0D0009D3610F80CC001D6B5007434C7FE8034C7CC1BC0FE19E0201580E0F0201201011002D3E11DBC4BE11DBC43232C7FE11DBC47E80B2C7F2407320008B083E1B7B51343480007E187E80007E18BE80007E18F4FFC07E1934FFC07E1974DFC07E19BC01887080A7F4C7C07E1A34C7C07E1A7D01007E1AB7807080E535007E1AF7BE1B2002012012130201201415008D3E13723E11BE117E113E10540132803E10BE80BE10FE8084F2FFC4B2FFF2DFFC02887080A7FE12BE127E121400F2C7C4B2C7FD0037807080E53E12C073253E1333C5B8B27B5520004D1C3C02FE106CFCB8193E803E800C3E1096283E18BE10C0683E18FE10BE10E8006EFCB819BC032000CF1D3C02FE106CFCB819348020C235C6083E4040E4BE1124BE117890CC3E443CB81974C7C060841A5B9A5D2EBCB81A3E118074DFD66EBCB81CBE803E800C3E1094882FBE10D4882FAC3CB819807E18BE18FE12F43E800C3E10BE10E80068006E7CB8199FFE187C0320004120843777222E9C20043232C15401B3C594013E808532DA84B2C7F2DFF2407EC02002012018190201D42B2C0201201A1B0201201E1F0201201C1D00E5473F00BD401D001D401D021F90102D31F01821043436D74BAF2E068F84601D37F59BAF2E072F844544355F910F8454330F910B0F2E065D33FD33F30F84822B9F84922B9B0F2E06C21F86820F869F84A6E915B8E19F84AD0D33FFA003171D721D33F305033BC02BCB1936DF86ADEE2F800F00C8006F3E12F43E800C7E903E900C3E09DBC41CBE10D62F24CC20C1B7BE10FE11963C03FE10BE11A04020BC03DC3E185C3E189C3E18DB7E1ABC032000B51D3C02F5007400750074087E4040B4C7C0608410DB1BDCEEBCB81A3E118074DFD66EBCB81CBE111510D57E443E1150CC3E442C3CB8197E80007E18BE80007E18F4CFF4CFCC3E1208AE7E1248AE6C3CB81B007E1A3E1A7E003C042001C1573F00BF84A6EF2E06AD2008308D71820F9012392F84492F845E24130F910F2E065D31F018210556E436CBAF2E068F84601D37F59BAF2E072D401D08308D71820F901F8444130F910F2E06501D430D08308D71820F901F8454130F910F2E06501820020120222301FED31F01821043685374BAF2E068F84601D37F59BAF2E072D33FFA00F404552003D200019AD401D0D33FFA00F40430937F206DE2303205D31F01821043685374BAF2E068F84601D37F59BAF2E072D33FFA00F404552003D200019AD401D0D33FFA00F40430937F206DE23032F8485280BEF8495250BEB0524BBE1AB0527ABE19210064B05215BE14B05248BE17B0F2E06970F82305C8CB3F5004FA0215F40015CB3F5004FA0212F400CB1F12CA00CA00C9F86AF00C01C31CFC02FE129BACFCB81AF48020C235C6083E4048E4BE1124BE1178904C3E443CB81974C7C0608410DA19D46EBCB81A3E118074DFD66EBCB81CB5007420C235C6083E407E11104C3E443CB81940750C3420C235C6083E407E11504C3E443CB81940602403F71CFC02FE129BACFCB81AF48020C235C6083E4048E4BE1124BE1178904C3E443CB81974C7C0608410DB10DBAEBCB81A3E118074DFD66EBCB81CBD010C3E12B434CFFE803D0134CFFE803D0134C7FE11DBC4148828083E08EE7CB81BBE11DBC4A83E08EF3CB81C34800C151D5A64D6D4C8F7A2B98E82A49B08B8C3816028292A01FCD31F01821043685374BAF2E068F84601D37F59BAF2E072D33FFA00F404552003D200019AD401D0D33FFA00F40430937F206DE2303205D31F01821043685374BAF2E068F84601D37F59BAF2E072D33FFA00F404552003D200019AD401D0D33FFA00F40430937F206DE230325339BE5381BEB0F8495250BEB0F8485290BEB02502FE5237BE16B05262BEB0F2E06927C20097F84918BEF2E0699137E222C20097F84813BEF2E0699132E2F84AD0D33FFA00F404D33FFA00F404D31FF8476F105220A0F823BCF2E06FD200D20030B3F2E073209C3537373A5274BC5263BC12B18E11323939395250BC5299BC18B14650134440E25319BAB3F2E06D9130E30D7F05C82627002496F8476F1114A098F8476F1117A00603E203003ECB3F5004FA0215F40012CB3F5004FA0213F400CB1F12CA00CA00C9F86AF00C00620A8020F4966FA5208E213050038020F4666FA1208E1001FA00ED1E15DA119450C3A00B9133E2923430E202926C21E2B31B000C3535075063140038C8CB3F5004FA0212F400CB3F5003FA0213F400CB1FCA00C9F86AF00C00D51D3C02FE129BACFCB81AFE12B434CFFE803D010C74CFFE803D010C74C7CC3E11DBC4283E11DBC4A83E08EE7CB81C7E003E10886808E87E18BE10D400E816287E18FE10F04026BE10BE10E83E189C3E18F7BE10B04026BE10FE10A83E18DC3E18F780693E1A293E1A7C042001F53B7EF4C7C8608419F1F4A06EA4CC7C037808608403818830AEA54C7C03B6CC780C882084155DD61FAEA54C3C0476CC780820841E6849BBEEA54C3C04B6CC7808208407C546B3EEA54C3C0576CC780820840223AA8CAEA54C3C05B6CC7808208419BDBC1A6EA54C3C05F6CC780C60840950CAA46EA53C0636CC78202D0008840FF2F00075BC7FE3A7805FC25E87D007D207D20184100D0CAF6A1EC7C217C21B7817C227C22B7817C237C23FC247C24B7817C2524C3B7818823881B22A021984008DBD0CABA7805FC20C8B870FC253748B8F07C256840206B90FD0018C020EB90FD0018B8EB90E98F987C23B7882908507C11DE491839707C23B788507C23B789507C11DE48B9F03A4331C4966';

export class PaymentChannelSource implements ContractSource {
    static create(opts: {
        workchain: number,
        publicKeyA: Buffer,
        publicKeyB: Buffer,
        channelId: number | BN,
        excessFee?: number | BN,
        addressA: Address,
        addressB: Address,
        closingConfig?: ClosingConfig
    }) {
        // Resolve parameters
        const {
            workchain,
            publicKeyA,
            publicKeyB,
            channelId,
            excessFee,
            addressA,
            addressB,
        } = opts;

        // Build initial code and data
        const initialCode = Cell.fromBoc(PAYMENT_CHANNEL_CODE_HEX)[0];
        const initialData = new Cell();
        initialData.bits.writeBit(0); // inited
        initialData.bits.writeCoins(0); // balance_A
        initialData.bits.writeCoins(0); // balance_B
        writePublicKey(initialData, publicKeyA);
        writePublicKey(initialData, publicKeyB);
        initialData.bits.writeUint(channelId, 128); // channel_id

        const closingConfig = new Cell();
        closingConfig.bits.writeUint(opts.closingConfig?.quarantineDuration || 0, 32); // quarantin_duration
        closingConfig.bits.writeCoins(opts.closingConfig?.misbehaviorFine || new BN(0)); // misbehavior_fine
        closingConfig.bits.writeUint(opts.closingConfig?.conditionalCloseDuration || 0, 32); // conditional_close_duration
        initialData.refs[0] = closingConfig;

        initialData.bits.writeUint(0, 32); // commited_seqno_A
        initialData.bits.writeUint(0, 32); // commited_seqno_B
        initialData.bits.writeBit(false); // quarantin ref

        const paymentConfig = new Cell();
        paymentConfig.bits.writeCoins(excessFee || new BN(0)); // excess_fee
        paymentConfig.bits.writeAddress(addressA); // addr_A
        paymentConfig.bits.writeAddress(addressB); // addr_B
        initialData.refs[1] = paymentConfig;

        return new PaymentChannelSource({
            initialCode,
            initialData,
            workchain,
            publicKeyA,
            publicKeyB,
            channelId,
            excessFee,
            addressA,
            addressB,
            closingConfig: opts.closingConfig,
        });
    }

    static restore(backup: string) {
        const store = new ConfigStore(backup);
        let closingConfig;
        try {
            const quarantineDuration = store.getInt('quarantineDuration');
            const misbehaviorFine = store.getInt('misbehaviorFine');
            const conditionalCloseDuration = store.getInt('conditionalCloseDuration');
            closingConfig = {
                quarantineDuration,
                misbehaviorFine,
                conditionalCloseDuration,
            };
        } catch {
            // pass
        }
        return PaymentChannelSource.create({
            workchain: store.getInt('wc'),
            publicKeyA: store.getBuffer('publicKeyA'),
            publicKeyB: store.getBuffer('publicKeyB'),
            channelId: store.getInt('channelId'),
            excessFee: store.getInt('excessFee'),
            addressA: store.getAddress('addressA'),
            addressB: store.getAddress('addressB'),
            closingConfig,
        });
    }

    readonly initialCode: Cell;

    readonly initialData: Cell;

    readonly workchain: number;

    readonly publicKeyA: Buffer;

    readonly publicKeyB: Buffer;

    readonly channelId: number | BN;

    readonly excessFee: number | BN;

    readonly addressA: Address;

    readonly addressB: Address;

    readonly closingConfig?: ClosingConfig;

    readonly type = 'org.ton.payments.channel';

    private constructor(opts: {
        initialCode: Cell,
        initialData: Cell,
        workchain: number,
        publicKeyA: Buffer,
        publicKeyB: Buffer,
        channelId: number | BN,
        excessFee?: number | BN,
        addressA: Address,
        addressB: Address,
        closingConfig?: ClosingConfig
    }) {
        this.initialCode = opts.initialCode;
        this.initialData = opts.initialData;
        this.workchain = opts.workchain;
        this.publicKeyA = opts.publicKeyA;
        this.publicKeyB = opts.publicKeyB;
        this.channelId = opts.channelId;
        this.excessFee = opts.excessFee ?? 0;
        this.addressA = opts.addressA;
        this.addressB = opts.addressB;
        this.closingConfig = opts.closingConfig;
        Object.freeze(this);
    }

    backup = () => {
        const store = new ConfigStore();
        store.setInt('wc', this.workchain);
        store.setBuffer('publicKeyA', this.publicKeyA);
        store.setBuffer('publicKeyB', this.publicKeyB);
        store.setInt('channelId', this.channelId instanceof BN ? this.channelId.toNumber() : this.channelId);
        store.setInt('excessFee', this.excessFee instanceof BN ? this.excessFee.toNumber() : this.excessFee);
        store.setAddress('addressA', this.addressA);
        store.setAddress('addressB', this.addressB);
        if (this.closingConfig) {
            const {
                quarantineDuration,
                misbehaviorFine,
                conditionalCloseDuration,
            } = this.closingConfig;
            store.setInt('quarantineDuration', quarantineDuration instanceof BN ? quarantineDuration.toNumber() : quarantineDuration);
            store.setInt('misbehaviorFine', misbehaviorFine instanceof BN ? misbehaviorFine.toNumber() : misbehaviorFine);
            store.setInt('conditionalCloseDuration', conditionalCloseDuration instanceof BN ? conditionalCloseDuration.toNumber() : conditionalCloseDuration);
        }
        return store.save();
    };

    describe = () => 'TON Payment channel';
}
