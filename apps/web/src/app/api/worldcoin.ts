import { WLD_API_BASE_URL, WLD_APP_ID } from '../webapp.config';

const verifyEndpoint = `${WLD_API_BASE_URL}/api/v1/verify/${WLD_APP_ID}`;

export const verifyWithWorldCoin = async (body) => {
    console.log('Received request to verify credential:\n', body);
    const reqBody = {
        nullifier_hash: body.nullifier_hash,
        merkle_root: body.merkle_root,
        proof: body.proof,
        credential_type: body.credential_type,
        action: body.action,
        signal: body.signal,
    };
    console.log('Sending request to World ID /verify endpoint:\n', reqBody);
    return fetch(verifyEndpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(reqBody),
    }).then((verifyRes) => {
        return verifyRes.json().then((wldResponse) => {
            console.log(
                `Received ${verifyRes.status} response from World ID /verify endpoint:\n`,
                wldResponse
            );
            if (verifyRes.status == 200) {
                // This is where you should perform backend actions based on the verified credential, such as setting a user as "verified" in a database
                // For this example, we'll just return a 200 response and console.log the verified credential
                console.log(
                    "Credential verified! This user's nullifier hash is: ",
                    wldResponse.nullifier_hash
                );
                const results = {
                    code: 'success',
                    detail: 'This action verified correctly!',
                };
                // res.status(verifyRes.status).send({
                //     code: 'success',
                //     detail: 'This action verified correctly!',
                // });

                return results;
                //   resolve(void 0);
            } else {
                // This is where you should handle errors from the World ID /verify endpoint. Usually these errors are due to an invalid credential or a credential that has already been used.
                // For this example, we'll just return the error code and detail from the World ID /verify endpoint.
                // res.status(verifyRes.status).send({
                //     code: wldResponse.code,
                //     detail: wldResponse.detail,
                // });

                return { error: 'Worldcoin verification Error' };
            }
        });
    });
};
