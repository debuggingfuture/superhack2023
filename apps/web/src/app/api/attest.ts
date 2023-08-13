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
) {}
