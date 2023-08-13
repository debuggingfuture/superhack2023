import { COVALENT_API_KEY } from '../webapp.config';

export const queryBalance = (address) => {
    let headers = new Headers();
    console.log('COVALENT_API_KEY', COVALENT_API_KEY);
    headers.set('Authorization', 'Bearer ' + COVALENT_API_KEY);

    return fetch(
        `https://api.covalenthq.com/v1/optimism-goerli/address/${address}/balances_v2/?`,
        { method: 'GET', headers: headers }
    ).then((resp) => resp.json());
};
