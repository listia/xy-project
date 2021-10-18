import { useRouter } from 'next/router'
import { useWeb3React } from "@web3-react/core";
import Head from "next/head";
import Link from "next/link";
import Account from "../components/Account";
import ETHBalance from "../components/ETHBalance";
import XYBalance from "../components/XYBalance";
import Footer from "../components/Footer";
import useEagerConnect from "../hooks/useEagerConnect";
import { METAVERSE } from "../util";

import Game from "../components/Game";

function Metaverse() {
  const router = useRouter()
  const { metaverse } = router.query;
  const { account, library } = useWeb3React();
  const triedToEagerConnect = useEagerConnect();
  const isConnected = typeof account === "string" && !!library;
  const metaverseName = metaverse && METAVERSE[metaverse.toString()] ? METAVERSE[metaverse.toString()].name : null;
  const metaverseLink = metaverse && METAVERSE[metaverse.toString()] ? METAVERSE[metaverse.toString()].link : null;

  if (!metaverseName) {
    return false;
  }
  
  return (
    <div>
      <Head>
        <title>{metaverseName}</title>
        <link rel="icon" href="/favicon.ico" />
        <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
      </Head>

      <main className="p-8 opacity-90">
        <div className="flex flex-col items-center space-y-6">
          <h1 className="text-3xl font-bold"><a href={metaverseLink} target="_blank" rel="noreferrer">{metaverseName}</a> Metaverse</h1>

          <h2 className="text-2xl font-bold text-center">
            Claim free <Link href="/">X,Y Coordinates</Link> / Add your NFTs to The Grid
          </h2>

          {isConnected && (
            <section className="w-full space-y-6">
              <div className="text-center">
                <Account triedToEagerConnect={triedToEagerConnect} />
                <XYBalance />
              </div>
            </section>
          )}

          {!isConnected && (
            <section className="w-full space-y-6">
              <div className="text-center">
                <Account triedToEagerConnect={triedToEagerConnect} />
              </div>
            </section>
          )}

          <Game contract={metaverse ? METAVERSE[metaverse.toString()].contract : ""} />

          <Footer />
        </div>
      </main>
    </div>
  );
}

export default Metaverse;
