'use client';
import { Metadata } from "next";
import type { ISuccessResult } from "@worldcoin/idkit";
import { CredentialType, IDKitWidget } from "@worldcoin/idkit";

import { WagmiConfig, configureChains, createConfig, useAccount, useConnect, useDisconnect } from 'wagmi'
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
} from 'wagmi/chains';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';
import { InjectedConnector } from 'wagmi/connectors/injected'

import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from "next/link";
import { ALCHEMY_API_KEY, WLD_ACTION_NAME, WLD_APP_ID } from "./webapp.config";
import { useState } from "react";

const { chains, publicClient } = configureChains(
  [mainnet, polygon, optimism, arbitrum, zora],
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
    // This is where you should perform frontend actions once a user has been verified, such as redirecting to a new page
    window.alert("Successfully verified with World ID! Your nullifier hash is: " + result.nullifier_hash);
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
    console.log("Sending proof to backend for verification:\n", JSON.stringify(reqBody)) // Log the proof being sent to our backend for visibility
    const res: Response = await fetch("/api/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reqBody),
    })
    const data = await res.json()
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


  const [proofs, setProofs] = useState([]);

  const addProof = (proof: any) => {
    setProofs([...proofs, proof]);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <main className="mx-auto w-auto px-4 pt-16 pb-8 sm:pt-24 lg:px-8">
        <h1 className="mx-auto text-center text-6xl font-extrabold tracking-tight text-white sm:text-7xl lg:text-8xl xl:text-8xl">
          <span className="block bg-gradient-to-r from-blue-500 to-green-500 bg-clip-text text-transparent px-2">
            AutoMicroGrant
          </span>
        </h1>
        <div className="mx-auto mt-5 max-w-xl sm:flex sm:justify-center md:mt-8">

          <ConnectButton />
        </div>

        <section>

          <h1 className="text-4xl text-white">Current whitelist</h1>

          <div>

          </div>
        </section>

        <div>
          AutoMicroGrant

          Show by attestor attesting you!

          {/* <Link href="/attestor">
            Attest
          </Link> */}



        </div>


        <div>
          <WorldCoinWidget addProof={addProof} />
        </div>

        <section className="mt-50">
          <h1 className="text-4xl text-white">Attest</h1>

          <h2 className="text-2xl text-white">Attest With Worldcoin</h2>


          <code>
            Submit and we will
          </code>
          <h2 className="text-2xl text-white">Grantee</h2>
          <div className="w-full max-w-xs">
            <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="receipent">
                  receipent
                </label>
                <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="receipent" type="text" placeholder="receipentaddress" />
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



export default function App() {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains}>
        <Home />
      </RainbowKitProvider>
    </WagmiConfig>
  );
}