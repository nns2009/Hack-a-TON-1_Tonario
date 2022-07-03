import {TonClient} from "ton";
import {baseUrl} from "../../API";

const testRpcUrl = baseUrl + 'jsonRPC';
const testApiKey = '09f1e024cbb6af1b0f608631c42b1427313407b7aa385009195e3f5c09d51fb8';

export const tonClient = new TonClient({
    endpoint: testRpcUrl,
    apiKey: testApiKey,
});

