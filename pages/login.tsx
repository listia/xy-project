import { useRouter } from 'next/router'
import { useWeb3React } from "@web3-react/core";
import Head from "next/head";
import Link from "next/link";
import Header from "../components/Header";
import Account from "../components/Account";
import Footer from "../components/Footer";
import useEagerConnect from "../hooks/useEagerConnect";
import useXYSignature from "../hooks/useXYSignature";
import { useEffect, useState } from 'react';
import axios from "axios";

function Login() {
  const router = useRouter()
  const params = router.query.params || []
  const isReady = router.isReady || false

  const { account, library } = useWeb3React();
  const triedToEagerConnect = useEagerConnect();
  const isConnected = typeof account === "string" && !!library;

  const [loginCode, setLoginCode] = useState("")
  const signature = useXYSignature(account);
  const getLoginCodeURL = '/api/getLoginCode';

  const getLoginCode = async (address, signature) => {
    axios({
      method: 'POST',
      url: getLoginCodeURL,
      data: {
        address: address,
        signature: signature
      },
    }).then((response) => {
      // @ts-ignore
      if (response && response.data && response.data.code) {
        // @ts-ignore
        setLoginCode(response.data.code)
      } else {
        setLoginCode("Unable to get login code. Please try again.")
      }
    }).catch(error => {
      setLoginCode("Unable to get login code. Please try again.")
    })
  }

  useEffect(() => {
    if (account && signature) {
      getLoginCode(account, signature);
    }
    return () => {
    }
  }, [account, signature]);

  return (
    <div>
      <Head>
        <title>X,Y Project Login</title>
        <link rel="icon" href="/favicon.ico" />
        <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
        
        <meta charSet="UTF-8" />
        <meta name="keywords" content="XY Project, Login, NFT, NFTs, Metaverse, Gaming, Land, Avatars, Minecraft, NFT Worlds, XY World, XY Squad" />
        <meta name="description" content="X,Y Project Login" />

        <meta property="og:title" content="X,Y Project Login" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://xyproject.io" />
        <meta property="og:image" content="http://xyproject.io/images/xy_world_icon.png" />
        <meta property="og:description" content="X,Y Project Login" />
      </Head>

      <Header triedToEagerConnect={triedToEagerConnect} isConnected={isConnected} />

      <main className="p-8">
        <div className="flex flex-col items-center space-y-5">

          <div className="w-full flex flex-col items-center">
            <section className="text-center">
              {isReady && isConnected && (
                <>
                  <p className="text-5xl font-bold">Connected to X,Y World</p>
                  <p className="text-xl pt-3">X,Y Project land and assets from this wallet will be available in-game</p>
                  <div className="flex flex-col items-center my-6">
                    <Account triedToEagerConnect={triedToEagerConnect} />
                  </div>
                  <p className="text-xl pt-3">Use your personal X,Y World Login Code when joining a game:</p>
                  <div className="text-4xl flex flex-col items-center font-bold my-6">
                    {loginCode}
                  </div>
                  <p className="text-l">(Do not share this code with others)</p>
                </>
              )}
              {isReady && !isConnected && (
                <>
                  <p className="text-5xl font-bold">Login to X,Y World</p>
                  <p className="text-xl pt-3">Connect your wallet to access your X,Y Project land and assets in-game</p>
                  <div className="flex flex-col items-center my-16">
                    <Account triedToEagerConnect={triedToEagerConnect} />
                  </div>
                </>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Login;
