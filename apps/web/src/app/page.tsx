
'use client';
import _ from 'lodash'
import { Metadata } from "next";
import type { ISuccessResult } from "@worldcoin/idkit";
import { CredentialType, IDKitWidget } from "@worldcoin/idkit";

import { WagmiConfig, configureChains, createConfig, useAccount, useBalance, useConnect, useDisconnect } from 'wagmi'
// import { createPublicClient, http } from 'viem'
import '@rainbow-me/rainbowkit/styles.css';

import {
  getDefaultWallets,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import {
  mainnet,
  polygon,
  optimism,
  arbitrum,
  zora,
  optimismGoerli,
  baseGoerli,
} from 'wagmi/chains';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';
import { InjectedConnector } from 'wagmi/connectors/injected'

import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from "next/link";
import { ALCHEMY_API_KEY, WLD_ACTION_NAME, WLD_APP_ID } from "./webapp.config";
import { useEffect, useMemo, useState } from "react";

// import { useNFT, useNFTMetadata } from '@zoralabs/nft-hooks'
import { useNFT, Networks, NFTFetchConfiguration, Strategies } from '@zoralabs/nft-hooks';


export const invokeApi = async (endpoint: string, reqBody: any): Promise<Response> => {
  return await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(reqBody),
  });
}

const { chains, publicClient } = configureChains(
  [mainnet, optimism, optimismGoerli, baseGoerli, zora],
  [
    alchemyProvider({ apiKey: ALCHEMY_API_KEY }),
    publicProvider()
  ]
);

const { connectors } = getDefaultWallets({
  appName: 'My RainbowKit App',
  projectId: '4730308c1c096741761b6882efdfa1e5',
  chains
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient
})



const WorldCoinWidget = ({ addProof }) => {
  const onSuccess = (result: ISuccessResult) => {

    addProof({
      type: 'worldcoin',
      data: {
        ...result
      },
      score: 0
    })
  };

  const handleProof = async (result: ISuccessResult) => {
    console.log("Proof received from IDKit:\n", JSON.stringify(result)); // Log the proof from IDKit to the console for visibility
    const reqBody = {
      merkle_root: result.merkle_root,
      nullifier_hash: result.nullifier_hash,
      proof: result.proof,
      credential_type: result.credential_type,
      action: WLD_ACTION_NAME,
      signal: "",
    };

    const res = await invokeApi('/api/verify', reqBody);
    const data = await res.json();

    if (res.status == 200) {
      console.log("Successful response from backend:\n", data); // Log the response from our backend for visibility
    } else {
      throw new Error(`Error code ${res.status} (${data.code}): ${data.detail}` ?? "Unknown error."); // Throw an error if verification fails
    }
  };


  return (
    <IDKitWidget
      action={WLD_ACTION_NAME!}
      app_id={WLD_APP_ID!}
      onSuccess={onSuccess}
      handleVerify={handleProof}
      credential_types={[CredentialType.Orb, CredentialType.Phone]}
      autoClose
    >
      {({ open }) =>
        <button className="!bg-black hover:bg-gray text-white font-bold py-2 px-4 border-white rounded focus:outline-none focus:shadow-outline" onClick={open}>
          <div className="mx-3 my-1">Verify with World ID</div>
        </button>

      }
    </IDKitWidget>
  )
}

function Home() {
  const [score, setScore] = useState(0);



  const [proofs, setProofs] = useState([]);

  const addProof = (proof: any) => {
    setProofs([...proofs, proof]);
  };

  const { address } = useAccount();


  const { data: balanceData, isError, isLoading: isBalanceLoading } = useBalance({
    address
  });

  const { data: nftData, error } = useNFT('0x9fa2f3c62968119398d258d3ef8b34e050b997db', '1')

  console.log('error', error);

  const attestWithProofs = () => {

  }

  const onClickAttest = () => {

  }

  const worldCoinResult = useMemo(() => {
    return _.find(proofs, p => p.type == 'worldcoin')
  }, [proofs])

  useEffect(() => {

    if (!isBalanceLoading && balanceData?.value > 100000000000n) {
      addProof({
        type: 'balance',
        value: 30
      })
    }

    // backend will verify
  }, [isBalanceLoading])

  useEffect(() => {

    setScore(_.sumBy(proofs, p => p.value));
    // backend will verify
  }, [proofs?.length])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2 text-white">
      <main className="mx-auto w-auto px-4 pt-16 pb-8 sm:pt-24 lg:px-8">
        <h1 className="mx-auto text-center text-6xl font-extrabold tracking-tight text-white sm:text-7xl lg:text-8xl xl:text-8xl mb-20">
          <span className="block bg-gradient-to-r from-blue-500 to-green-500 bg-clip-text text-transparent px-2">
            AutoMicroGrant
          </span>
        </h1>


        <section className="m-5">

          <div className="text-white underline text-4xl mb-4">
            <Link href="https://goerli-optimism.etherscan.io/address/0x37bc88f16e2ac014085feb977ce167fd9c6158639b6e79c027ce22de2455ada2" target="_blank">
              MicroGrant Contract: 0x123
            </Link>
          </div>


          <h1 className="text-2xl text-white mb-4">Current whitelist</h1>
          <div className="grid grid-cols-2 gap-4 text-white text-lg">
            <div>Address: </div>
            <div>Shares:</div>
            {/* <div>claimed: </div> */}
            <div>0x4513e09002228b6F9bfac47CFaA0c58D5227a0a3</div>
            <div>10</div>
            {/* <div> Y</div> */}
            <div>0x4513e09002228b6F9bfac47CFaA0c58D5227a0a3</div>
            <div>20</div>

          </div>

          <div>

          </div>
        </section>
        <section className="m-5">

          <div>


            <h1 className="mx-auto text-center text-4xl mt-40 mb-30 font-extrabold tracking-tight text-white sm:text-7xl ">
              <span className="block bg-gradient-to-r from-red-500 to-green-500 bg-clip-text text-transparent px-2">
                Reputation Score: <br />
                {score}
              </span>
            </h1>


            <h3 className="text-2xl">
              Connect your wallet and we will check if you fulfil the criteria
            </h3>

            <div className="mx-auto mt-5 max-w-xl sm:flex sm:justify-center md:mt-8 m-10">
              <ConnectButton />
            </div>



            <div className="rounded border border-white p-10">
              <h3 className="text-2xl">
                ☑️ WorldCoin: Must-have
              </h3>
              <h6>
                We use WorldCoin to guarantee you can only grant 2 projects
              </h6>
              <div>
                {
                  worldCoinResult ? (
                    <div className="text-green-500 text-2xl">
                      You're qualified to attest!
                    </div>
                  ) : (
                    <WorldCoinWidget addProof={addProof} /
                    >)
                }
              </div>
            </div>


            <div className="rounded border border-white p-10">
              <h3 className="text-2xl">
                ☑️ 3D.ZORB NFT Ownership: +20 Optional
              </h3>
              <span className="underline">
                <Link target="_blank" href="https://zora.co/collect/zora:0x9fa2f3c62968119398d258d3ef8b34e050b997db/3">Zora</Link>
              </span>

              <div className="w-1/2 m-auto">
                <img src="https://remote-image.decentralized-content.com/image?url=https%3A%2F%2Fipfs.decentralized-content.com%2Fipfs%2Fbafybeiavecwcmcdvquh3evaw7r4fslfgz3noavnipdzffjlg3phtwcpiom&w=1920&q=75" ></img>
              </div>
              {
                _.find(proofs, p => p.type == 'nft') && (
                  <>
                    <div>
                      Balance: {balanceData?.formatted} {balanceData?.symbol}
                    </div>
                    <div className="text-green-500 text-2xl"> +30 score!</div>
                  </>
                )
              }


              {
                nftData && (<>
                  <h3>{nftData.metadata.name}</h3>
                  <p>{nftData.metadata.description}</p>
                  <p>Owned by: {nftData.nft.owner.address}</p>
                </>
                )
              }

            </div>

            {/* 0x45187736a54d60c80b6e16e8d8e79ef0ba09d6a7 */}

            <div className="rounded border border-white p-10">
              <h3 className="text-2xl">
                ☑️ Token balance > 0.01 ETH: +30 Optional
              </h3>
              {
                !address || isBalanceLoading && (
                  <div>  connect first! </div>
                )
              }
              {
                _.find(proofs, p => p.type == 'balance') && (
                  <>
                    <div>
                      Balance: {balanceData?.formatted} {balanceData?.symbol}
                    </div>
                    <div className="text-green-500 text-2xl"> +30 score!</div>
                  </>
                )
              }




            </div>






          </div>

        </section>

        <section className="mt-20 mb-20">
          <h3 className="text-2xl">Proofs</h3>
          <code className="w-1/2 break-all">
            {JSON.stringify(proofs, null, 2)}
          </code>
        </section>



        <section className="mt-50 w-full">
          <h1 className="text-4xl text-white">Attest for grantee</h1>
          <code>
            Submit and we will attest it on-chain for the receipent
          </code>
          <div className="w-full rounded border border-white p-10">
            <form className="shadow-md rounded px-8 pt-6 pb-8 mb-4">
              <div className="mb-4">
                <label className="block text-white text-lg font-bold mb-2" htmlFor="receipent">
                  receipent
                </label>
                <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="receipent" type="text" placeholder="receipent address" />
              </div>

              <div className="flex items-center justify-between">
                <button className="!bg-blue-700 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button">
                  Attest
                </button>

              </div>
            </form>

          </div>
          {/* <Button>
            Attestor
          </Button> */}


        </section>

      </main>
    </div>
  );
}


// https://github.com/ourzora/nft-hooks/blob/main/src/backends/zdk/utils/getChainFromNetwork.ts#L4
export default function App() {
  const strategy = Strategies.ZDKFetchStrategy
  const zdkStrategy = new strategy('1');
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains}>

        <NFTFetchConfiguration strategy={zdkStrategy} networkId={Networks.MAINNET}>
          <Home />
        </NFTFetchConfiguration>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}