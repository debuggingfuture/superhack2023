import _ from 'lodash';
import { NextResponse } from 'next/server';
import { verifyWithWorldCoin } from '../worldcoin';
import { queryBalance } from '../covalent';
import { WLD_ACTION_NAME } from '../../webapp.config';
import { attestAggregated } from 'reputation';

export async function POST(req: Request) {
    const body = await req.json();
    console.log('body', body);

    const { proofs, attestorAddress, recipient } = body;

    const proofWld = _.find(proofs, { type: 'worldcoin' });

    const proofBalance = _.find(proofs, { type: 'balance' });

    console.log('attest with proofs');
    console.log(proofs);

    if (proofWld) {
        const verifyWldResults = await verifyWithWorldCoin({
            action: WLD_ACTION_NAME,
            signal: '',
            ...(proofWld?.data || {}),
        });
        console.log('wld', proofWld, verifyWldResults);
        if (verifyWldResults['error']) {
            console.log('error', verifyWldResults['error']);
            return NextResponse.json(
                { code: 'error', detail: 'Proof verification failed' },
                { status: 500 }
            );
        }
    }

    if (proofBalance) {
        const results = await queryBalance(attestorAddress);
        console.log('balance', results);
        const data = results?.data;
        const items = data?.items;
        const eth = _.find(items, { contract_ticker_symbol: 'ETH' });
        console.log('balance eth', eth);
        if (!results || parseInt(eth?.balance) <= 993699999777748) {
            return NextResponse.json(
                { code: 'error', detail: 'Proof verification failed: balance' },
                { status: 500 }
            );
        }
    }

    const poolAddress = '0xa94634ef7d439a137162dd56f8e66cdb812d3d3c';
    const attestResults = await attestAggregated(
        poolAddress,
        attestorAddress,
        '0x4513e09002228b6F9bfac47CFaA0c58D5227a0a3'
    );

    console.log('attest results', attestResults);

    return NextResponse.json(attestResults, { status: 200 });
}
