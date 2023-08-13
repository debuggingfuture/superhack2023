// create our schema

import {
    EAS,
    Offchain,
    SchemaEncoder,
    SchemaRegistry,
} from '@ethereum-attestation-service/eas-sdk';
import { BaseWallet, ethers } from 'ethers';
import {
    EAS_CONTRACT_ADDRESS_BASE,
    EAS_CONTRACT_ADDRESS_OPTIMISM,
    EAS_CONTRACT_ADDRESS_OPTIMISM_GOERLI,
    EAS_CONTRACT_ADDRESS_SCHEMA_REGISTRY_BASE,
    EAS_CONTRACT_ADDRESS_SCHEMA_REGISTRY_OPTIMISM_GOERLI,
} from './app.config';
import {
    createOffchainURL,
    ZERO_ADDRESS,
    ZERO_BYTES,
    ZERO_BYTES32,
} from '@ethereum-attestation-service/eas-sdk';
export const getNetworkConfig = (chainId: number) => {
    return {
        // 'optimistic-goerli'
        420: {
            easContractAddress: EAS_CONTRACT_ADDRESS_OPTIMISM_GOERLI,
            easSchemaRegistryAddress:
                EAS_CONTRACT_ADDRESS_SCHEMA_REGISTRY_OPTIMISM_GOERLI,
            easscanUrl: 'https://optimism-goerli-bedrock.easscan.org',
            etherscanUrl: 'https://goerli-optimism.etherscan.io',
        },
        84531: {
            easContractAddress: EAS_CONTRACT_ADDRESS_BASE,
            easSchemaRegistryAddress: EAS_CONTRACT_ADDRESS_SCHEMA_REGISTRY_BASE,
            easscanUrl: 'https://base-goerli.easscan.org',
        },
    }[chainId]!;
};

const {
    easContractAddress,
    easSchemaRegistryAddress,
    easscanUrl,
    etherscanUrl,
} = getNetworkConfig(420);

export const getSigner = () => {
    // Initialize the sdk with the address of the EAS Schema contract address
    const eas = new EAS(easContractAddress);

    const provider = new ethers.AlchemyProvider(
        420,
        'B1DZ5EWY5Bi-xkKSSubkVROc_NY9IRJ7'
    );

    const privateKey = process.env.DEPLOYER_PRIVATE_KEY as string;
    return new ethers.Wallet(privateKey, provider);
};

const ATTESTATION_SCHEMA = 'uint256 poolId, uint256 shares, address[] refIds';
const SCHEMA_UID =
    '0x56a96e1de1496417fa2b49b4eecc994a672144488ca6d48236c2ffd758f44acc';

export const encodeDataWithSchema = (
    poolId: number,
    shares: number,
    refIds: string[]
) => {
    const schemaUid =
        '0x424041413f6893c2f2e3e0e91ce9e26763840795b9c7fbb3866502e8d5c94677';
    // const schemaEncoder = new SchemaEncoder(ATTESTATION_SCHEMA);
    // return schemaEncoder.encodeData([
    //     { name: 'poolId', value: poolId, type: 'uint256' },
    //     { name: 'shares', value: shares, type: 'uint256' },
    //     { name: 'refIds', value: [], type: 'address[]' },
    // ]);

    const schemaEncoder = new SchemaEncoder('uint256 eventId, uint8 voteIndex');
    const encodedData = schemaEncoder.encodeData([
        { name: 'eventId', value: 1, type: 'uint256' },
        { name: 'voteIndex', value: 1, type: 'uint8' },
    ]);

    return { schemaUid, encodedData };
};

export const registerAttestationSchema = async () => {
    const signer = getSigner();
    // Connects an ethers style provider/signingProvider to perform read/write functions.
    // MUST be a signer to do write operations!
    // eas.connect(provider);

    const schemaRegistry = new SchemaRegistry(easSchemaRegistryAddress);

    schemaRegistry.connect(signer);

    const resolverAddress = '0x0000000000000000000000000000000000000000';
    const revocable = true;

    const transaction = await schemaRegistry.register({
        schema: ATTESTATION_SCHEMA,
        resolverAddress,
        revocable,
    });

    // Optional: Wait for transaction to be validated
    const schemaUid = await transaction.wait();
    console.log('schemaUid', schemaUid);
    console.log('easscanUrl', easscanUrl + '/schema/view/' + schemaUid);
};

// export const timestampAttestation = (eas, attestation) => {
//     eas.timestampAttestation(attestation);
// };

// got everything we need, attest for grant
export const attestAggregated = async (recipient: string) => {
    const signer = getSigner();

    const eas = new EAS(easContractAddress);
    eas.connect(signer);

    const { schemaUid, encodedData } = encodeDataWithSchema(1, 30, []);

    // await attestOffchain({ eas, signer, targetAddress, schemaUid, encodedData });

    await attestOnChain({ eas, signer, recipient, schemaUid, encodedData });
};

export const attestOnChain = async ({
    eas,
    signer,
    recipient,
    schemaUid,
    encodedData,
}) => {
    eas.connect(signer);
    const transaction = await eas.attest({
        schema: schemaUid,
        data: {
            recipient,
            expirationTime: 0,
            revocable: true, // Be aware that if your schema is not revocable, this MUST be false
            data: encodedData,
        },
    });

    const results = await transaction.wait();

    console.log('results', results, transaction.tx.hash);

    const txHash = transaction.tx.hash;
    const etherscanTxUrl = etherscanUrl + '/tx/' + txHash;

    const easscanAttestationUrl = easscanUrl + '/attestation/view/' + results;
    return {
        easscanAttestationUrl,
        etherscanTxUrl,
        txHash,
        uid: results,
    };
};

export const attestOffchain = async ({
    eas,
    signer,
    recipient,
    schemaUid,
    encodedData,
}) => {
    const offchain = await eas.getOffchain();
    const offchainAttestation = await offchain.signOffchainAttestation(
        {
            recipient,
            expirationTime: BigInt(0),
            // Unix timestamp of current time
            time: BigInt(Math.floor(Date.now() / 1000)),
            revocable: true,
            version: 1,
            nonce: BigInt(0),
            schema: schemaUid,
            refUID: ZERO_BYTES32,
            data: encodedData,
        },
        signer as unknown as BaseWallet
    );

    console.log('offchainAttestation', offchainAttestation, signer.address);

    const easscanAttestationUrl =
        easscanUrl +
        createOffchainURL({
            sig: offchainAttestation,
            signer: signer.address,
        });
    // private by default, share the object

    // const tx = await eas.timestamp(offchainAttestation?.uid);
    // const timestampResults = await tx.wait();

    // const etherscanTxUrl = etherscanUrl + '/address/';
    // console.log('timestampResults', timestampResults, tx);

    // need to force chainId to be number otherwise signature failed at UI
    const verifyResults = await offchain.verifyOffchainAttestationSignature(
        signer.address,
        offchainAttestation
    );

    // potentially payload issue for Signature check failed
    console.log('verify signature', verifyResults);
    console.log({
        // etherscanTxUrl,
        easscanAttestationUrl,
    });
};
