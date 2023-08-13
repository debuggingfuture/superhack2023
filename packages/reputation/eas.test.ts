import { describe, jest, test } from '@jest/globals';

import { attestAggregated, registerAttestationSchema } from './eas';

jest.setTimeout(1000 * 60 * 5);

describe('reputaiton', () => {
    test.skip('#registerAttestationSchema', async () => {
        await registerAttestationSchema();
    });

    test('attest aggregated', async () => {
        await attestAggregated('0x4513e09002228b6F9bfac47CFaA0c58D5227a0a3');

        // expect(await offchain.verifyOffchainAttestationSignature(await sender.getAddress(), response)).to.be.true;
    });
});
