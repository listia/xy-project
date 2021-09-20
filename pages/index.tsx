import { useWeb3React } from "@web3-react/core";
import Head from "next/head";
import Link from "next/link";
import Account from "../components/Account";
import ETHBalance from "../components/ETHBalance";
import XYBalance from "../components/XYBalance";
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
      </Head>

      <main>
        <br/>
        <h1>
            X,Y Project
        </h1>

        <h3>
          <b><a href="https://opensea.io/collection/xy-coordinates">OpenSea</a></b>&nbsp;|&nbsp;
          <b><a href="https://etherscan.io/address/0x3ca53be299c765cdc66cc1723f8b3eefb3aaa413">Etherscan</a></b>&nbsp;|&nbsp;
          <b><a href="https://twitter.com/XYCoordinates">Twitter</a></b>
        </h3>

        <p>Example Coordinates:</p>
        <a href="https://opensea.io/assets/0x3ca53be299c765cdc66cc1723f8b3eefb3aaa413/4750?ref=0xe3Ca71F5D505937959893CdEFd2704f062E14833" target="_blank" rel="noreferrer"><img src="https://storage.opensea.io/files/98692044b0fc95750f5daf58d62f957d.svg" width="200" /></a>
        &nbsp;
        <a href="https://opensea.io/assets/0x3ca53be299c765cdc66cc1723f8b3eefb3aaa413/1416?ref=0xe3Ca71F5D505937959893CdEFd2704f062E14833" target="_blank" rel="noreferrer"><img src="https://storage.opensea.io/files/0c834b4ba5c297a97acd5c6b55999585.svg" width="200" /></a>
        &nbsp;
        <a href="https://opensea.io/assets/0x3ca53be299c765cdc66cc1723f8b3eefb3aaa413/9934?ref=0xe3Ca71F5D505937959893CdEFd2704f062E14833" target="_blank" rel="noreferrer"><img src="https://storage.opensea.io/files/9932a81ae30a4785940cbe8df8a61945.svg" width="200" /></a>

        <p></p>

        <section>
          <p>The X,Y Project is a full set of X,Y Coordinates stored on chain, representing a 128x128 grid.</p>
          <p>Use X,Y Project in any way you want. For example: maps, tiles, locations, games, virtual worlds, and more.</p>
        </section>

        <p></p>

        <h2>          
          Claim your Free X,Y Project NFTs (until they are all minted)
        </h2>

        {isConnected && (
          <section>
            <Account triedToEagerConnect={triedToEagerConnect} />
            <ETHBalance />
            <XYBalance />
            <Game />
          </section>
        )}

        {!isConnected && (
          <section>
            Please connect your Wallet/Metamask<br/><br/>
            <Account triedToEagerConnect={triedToEagerConnect} />
          </section>
        )}

        <p>
          <br/>
          Brought to you by the team @ <a href="https://nftyverse.com" target="_blank" rel="noreferrer">NFTYverse API</a>
          <br/><br/>
          This website is <a href="https://github.com/listia/xy-project" target="_blank" rel="noreferrer">Open-Source</a>
          <br/><br/><br/><br/>
          <div className="terms" style={{color: "#aaaaaa"}}>
            X,Y Project is a fun, community-focused metaverse NFT project.
            Please feel free to use it in any way you want.
            Claim X,Y corodinates, issue blockchain transactions, and use the NFTs at your own risk.
            Full website functionality requries Metamask or a similar wallet plugin.
            We do not track or store your information.
            Ownership data is pulled directly from the public Ethereum blockchain.
            All information on this website is provided &quot;AS IS&quot;.
            The website is open source, free to use and makes no warranties, express, implied or otherwise, regarding its accuracy, completeness or performance.
            Enjoy the X,Y Project and drop us a line on <a href="https://twitter.com/XYCoordinates">Twitter</a> if you have any questions!
          </div>
          <br/><br/><br/>
        </p>
      </main>

      <style jsx>{`
        main {
          text-align: center;
        }
      `}</style>
    </div>
  );
}

export default Home;
