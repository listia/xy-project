import { useWeb3React } from "@web3-react/core";
import Head from "next/head";
import Link from "next/link";
import Account from "../components/Account";
import ETHBalance from "../components/ETHBalance";
import XYHead from "../components/XYHead";
import XYBalance from "../components/XYBalance";
import Footer from "../components/Footer";
import useEagerConnect from "../hooks/useEagerConnect";

import Game from "../components/Game";

function Home() {
  const { account, library } = useWeb3React();

  const triedToEagerConnect = useEagerConnect();

  const isConnected = typeof account === "string" && !!library;

  return (
    <div>
      <Head>
        <title>X,Y Project</title>
        <link rel="icon" href="/favicon.ico" />
        <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
      </Head>

      <main className="p-8 opacity-90">
        <div className="flex flex-col items-center space-y-6">

          <XYHead />

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

          <Game />

          <Footer />
        </div>
      </main>
    </div>
  );
}

export default Home;
