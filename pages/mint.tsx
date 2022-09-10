import { useRouter } from 'next/router'
import { useWeb3React } from "@web3-react/core";
import Head from "next/head";
import Link from "next/link";
import Header from "../components/Header";
import Account from "../components/Account";
import Footer from "../components/Footer";
import useEagerConnect from "../hooks/useEagerConnect";
import { useEffect, useState } from 'react';
import axios from "axios";
import XYWorldMint from "../components/XYWorldMint";

function Login() {
  const router = useRouter()
  const params = router.query.params || []
  const isReady = router.isReady || false

  const { account, library } = useWeb3React();
  const triedToEagerConnect = useEagerConnect();
  const isConnected = typeof account === "string" && !!library;

  useEffect(() => {
    return () => {
    }
  }, []);

  return (
    <div>
      <Head>
        <title>X,Y Project: Mint X,Y World Associative NFT Land</title>
        <link rel="icon" href="/favicon.ico" />
        <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
        
        <meta charSet="UTF-8" />
        <meta name="keywords" content="XY Project, Mint X,Y World, NFT, NFTs, Metaverse, Gaming, Land, Avatars, Minecraft, NFT Worlds, XY World, XY Squad" />
        <meta name="description" content="X,Y Project - Mint X,Y World Associative NFT" />

        <meta property="og:title" content="X,Y Project Mint Page" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://xyproject.io" />
        <meta property="og:image" content="http://xyproject.io/images/xy_world_icon.png" />
        <meta property="og:description" content="X,Y Project Mint Page" />
      </Head>

      <Header triedToEagerConnect={triedToEagerConnect} isConnected={isConnected} />

      <main className="p-8">
        <div className="flex flex-col items-center space-y-5">

          <div className="w-full flex flex-col items-center">
            <section className="text-center">
              <p className="text-4xl font-bold">The X,Y World Mint is LIVE!</p>
              {isReady && isConnected && (
                
                <XYWorldMint />
              )}
              {isReady && !isConnected && (
                <>
                  <p className="text-xl pt-3">Connect your wallet to access your X,Y Coordinates and Mint X,Y World NFTs</p>
                  <div className="flex flex-col items-center my-8">
                    <Account triedToEagerConnect={triedToEagerConnect} />
                  </div>
                </>
              )}
            </section>
          </div>

          <Footer />
        </div>
      </main>
    </div>
  );
}

export default Login;
