import type { NextApiRequest, NextApiResponse } from 'next';

export const config = {
    api: {
        externalResolver: true,
    },
};

export type VerifyReply = {
    isSuccess: boolean;
};

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<VerifyReply>
) {
    // 0xf4910C763eD4e47A585E2D34baA9A4b611aE448C
    // 0x7CdE8D9aFC02268C847fF43BA976e7E6020C1222
}
