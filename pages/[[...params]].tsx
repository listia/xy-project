import { useRouter } from 'next/router'
import { useWeb3React } from "@web3-react/core";
import Head from "next/head";
import Link from "next/link";
import Header from "../components/Header";
import ETHBalance from "../components/ETHBalance";
import XYHead from "../components/XYHead";
import Footer from "../components/Footer";
import useEagerConnect from "../hooks/useEagerConnect";
import { METAVERSE, MAX_SIZE } from "../util";

import Game from "../components/Game";

function validParams(numParams, metaverseName, zoom, x, y) {
  const validZoom = zoom && (x || x == 0) && (y || y == 0);
  if (numParams == 4 && metaverseName && validZoom) {
    return true;
  }
  if (numParams == 3 && validZoom) {
    return true;
  }
  if (numParams == 1 && metaverseName) {
    return true;
  }
  if (numParams == 0) {
    return true;
  }
  return false;
}

function Home() {
  const router = useRouter()
  const params = router.query.params || []
  const isReady = router.isReady || false
  const metaverse = params[0];
  const metaverseName = metaverse && METAVERSE[metaverse.toString()] ? METAVERSE[metaverse.toString()].name : null;
  const metaverseLink = metaverse && METAVERSE[metaverse.toString()] ? METAVERSE[metaverse.toString()].link : null;
  const zoomParams = metaverseName ? params.slice(1, 4) : params.slice(0, 3)
  // @ts-ignore
  const zoomParamsInt = zoomParams.map(Number);
  const zoom = zoomParamsInt[0] && [2, 4, 8, 16].includes(zoomParamsInt[0]) ? zoomParamsInt[0] : null;
  const x = (zoomParamsInt[1] || zoomParamsInt[1] == 0) && 0 <= zoomParamsInt[1] && zoomParamsInt[1] < MAX_SIZE ? zoomParamsInt[1] : null;
  const y = (zoomParamsInt[2] || zoomParamsInt[2] == 0) && 0 <= zoomParamsInt[2] && zoomParamsInt[2] < MAX_SIZE ? zoomParamsInt[2] : null;

  const editing = router.query.edit;

  const { account, library } = useWeb3React();

  const triedToEagerConnect = useEagerConnect();

  const isConnected = typeof account === "string" && !!library;

  if(!validParams(params.length, metaverseName, zoom, x, y)) {
    return(false);
  }

  return (
    <div>
      <Head>
        <title>{metaverseName ? metaverseName : "X,Y Project"}</title>
        <link rel="icon" href="/favicon.ico" />
        <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
      </Head>

      <Header triedToEagerConnect={triedToEagerConnect} isConnected={isConnected} />

      <main className="p-8">
        <div className="flex flex-col items-center space-y-5">

          <XYHead metaverseName={metaverseName} metaverseLink={metaverseLink} />

          {isReady && params.length == 0 && (
            <Game />
          )}
          {isReady && params.length == 1 && (
            <Game contract={METAVERSE[metaverse.toString()].contract} metaverse={metaverse} />
          )}
          {isReady && params.length == 3 && (
            <Game zoom={zoom} x={x} y={y} />
          )}
          {isReady && params.length == 4 && (
            <Game contract={METAVERSE[metaverse.toString()].contract} metaverse={metaverse} zoom={zoom} x={x} y={y} />
          )}

          <Footer />
        </div>
      </main>
    </div>
  );
}

export default Home;
