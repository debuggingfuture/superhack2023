import _ from 'lodash';
import { NextResponse } from 'next/server';
import { verifyWithWorldCoin } from '../worldcoin';
import { queryBalance } from '../covalent';

export const config = {
    api: {
        externalResolver: true,
    },
};

export async function POST(req: Request) {
    const body = await req.json();
    console.log('body', body);

    const proofs = body.proofs;
    const attestorAddress = body.attestorAddress;

    const proofWld = _.find(proofs, { type: 'worldcoin' });

    const proofBalance = _.find(proofs, { type: 'balance' });

    console.log('attest with proofs');
    console.log(proofs);

    if (proofWld) {
        const verifyWldResults = await verifyWithWorldCoin(proofWld?.data);
        // console.log('wld', proofWld, verifyWldResults);
        // if (verifyWldResults['error']) {
        //     return NextResponse.json(
        //         { code: 'error', detail: 'Proof verification failed' },
        //         { status: 500 }
        //     );
        // }
    }

    if (proofBalance) {
        const results = await queryBalance(attestorAddress);
        console.log('balance', results);
        const data = results?.data;
        const items = data?.items;
        const eth = _.find(items, { contract_ticker_symbol: 'ETH' });
        console.log('balance eth', eth);
        if (!results || parseInt(eth?.balance) <= 10000000000000000) {
            return NextResponse.json(
                { code: 'error', detail: 'Proof verification failed: balance' },
                { status: 500 }
            );
        }
    }

    const results = {
        uid: '0xcdecd7e508426a8151bbdbcc67ad2820e94886c223c12b0fcf2bf1b201b5f145',
    };
    return NextResponse.json(results, { status: 200 });
}
