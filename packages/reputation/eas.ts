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
    EAS_CONTRACT_ADDRESS_SCHEMA_REGISTRY_OPTIMISM,
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
        10: {
            easContractAddress: EAS_CONTRACT_ADDRESS_OPTIMISM,
            easSchemaRegistryAddress:
                EAS_CONTRACT_ADDRESS_SCHEMA_REGISTRY_OPTIMISM,
            easscanUrl: 'https://optimism.easscan.org',
            etherscanUrl: 'https://optimistic.etherscan.io',
        },

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

const ATTESTATION_SCHEMA =
    'address poolAddress, address attestorAddress, address[] refIds';
const SCHEMA_UID =
    '0x233e16af3559cd70e7483d216a6274e91a9678111230453085d2c712d7819d42';

export const encodeDataWithSchema = (
    poolAddress: string,
    shares: number,
    attestorAddress: string,
    refIds: string[]
) => {
    const schemaUid = SCHEMA_UID;
    const schemaEncoder = new SchemaEncoder(ATTESTATION_SCHEMA);
    const encodedData = schemaEncoder.encodeData([
        { name: 'poolAddress', value: poolAddress, type: 'address' },
        // { name: 'shares', value: shares, type: 'uint256' },
        { name: 'attestorAddress', value: attestorAddress, type: 'address' },
        { name: 'refIds', value: [], type: 'address[]' },
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

// got everything we need, attest for grant
export const attestAggregated = async (
    poolAddress: string,
    attestorAddress: string,
    recipient: string
) => {
    const signer = getSigner();

    const eas = new EAS(easContractAddress);
    eas.connect(signer);

    const { schemaUid, encodedData } = encodeDataWithSchema(
        poolAddress,
        30,
        attestorAddress,
        []
    );

    // await attestOffchain({ eas, signer, targetAddress, schemaUid, encodedData });

    return attestOnChain({
        eas,
        signer,
        recipient,
        schemaUid,
        encodedData,
    });
};

export const attestOnChain = async ({
    eas,
    signer,
    recipient,
    schemaUid,
    encodedData,
}) => {
    eas.connect(signer);
    console.log('attest on chain');
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

    const easscanAttestationUrl = easscanUrl + '/attestation/view/' + results;
    console.log('results', results, easscanAttestationUrl, transaction.tx.hash);

    const txHash = transaction.tx.hash;
    const etherscanTxUrl = etherscanUrl + '/tx/' + txHash;

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
