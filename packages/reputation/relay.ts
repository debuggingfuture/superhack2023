import { RelayClient } from '@openzeppelin/defender-relay-client';

const OZ_DEFENDER_API_KEY = process.env.OZ_DEFENDER_API_KEY as string;
const OZ_DEFENDER_API_SECRET = process.env.OZ_DEFENDER_API_SECRET as string;


const relayClient = new RelayClient({ apiKey: OZ_DEFENDER_API_KEY, apiSecret: OZ_DEFENDER_API_SECRET });

// send raw txn / EIP 191 or 712 signature i.e. not sdk


// as ethersjs v5 provider
// https://www.npmjs.com/package/@openzeppelin/defender-relay-client