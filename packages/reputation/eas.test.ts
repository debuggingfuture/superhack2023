import { describe, jest, test } from '@jest/globals';

import { attestAggregated, registerAttestationSchema } from './eas';

jest.setTimeout(1000 * 60 * 5);

describe('reputaiton', () => {
    test.skip('#registerAttestationSchema', async () => {
        await registerAttestationSchema();
    });

    test('attest aggregated', async () => {
        const attestorAddress = '0x7CdE8D9aFC02268C847fF43BA976e7E6020C1222';
        const poolAddress = '0xa94634ef7d439a137162dd56f8e66cdb812d3d3c';
        await attestAggregated(
            poolAddress,
            attestorAddress,
            '0x4513e09002228b6F9bfac47CFaA0c58D5227a0a3'
        );

        // expect(await offchain.verifyOffchainAttestationSignature(await sender.getAddress(), response)).to.be.true;
    });
});
