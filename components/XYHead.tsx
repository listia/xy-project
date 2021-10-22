import Link from "next/link";

const XYHead = (props) => {
  return (
    <>
      <h1 className="text-3xl font-bold">X,Y Project</h1>

      <h4 className="font-medium">
        <a target="_blank" rel="noreferrer" href="https://opensea.io/collection/xy-coordinates?ref=0xe3Ca71F5D505937959893CdEFd2704f062E14833">OpenSea</a>&nbsp;&nbsp;|&nbsp;&nbsp;
        <a target="_blank" rel="noreferrer" href="https://etherscan.io/address/0x3ca53be299c765cdc66cc1723f8b3eefb3aaa413">Etherscan</a>&nbsp;&nbsp;|&nbsp;&nbsp;
        <a target="_blank" rel="noreferrer" href="https://twitter.com/XYCoordinates">Twitter</a>&nbsp;&nbsp;|&nbsp;&nbsp;
        <a target="_blank" rel="noreferrer" href="https://discord.com/invite/zBWEsfufPZ">Discord</a>
      </h4>

      <h4 className="font-medium">
        Choose a Metaverse:&nbsp;
        <Link href="/NFTWorlds">NFT Worlds</Link>&nbsp;&nbsp;&#183;&nbsp;
        more coming soon...
      </h4>

      <div className="flex flex-row space-x-2">
        <a href="https://opensea.io/assets/0x3ca53be299c765cdc66cc1723f8b3eefb3aaa413/4750?ref=0xe3Ca71F5D505937959893CdEFd2704f062E14833" target="_blank" rel="noreferrer"><img src="https://storage.opensea.io/files/98692044b0fc95750f5daf58d62f957d.svg" width="160" /></a>
        <a href="https://opensea.io/assets/0x3ca53be299c765cdc66cc1723f8b3eefb3aaa413/1416?ref=0xe3Ca71F5D505937959893CdEFd2704f062E14833" target="_blank" rel="noreferrer"><img src="https://storage.opensea.io/files/0c834b4ba5c297a97acd5c6b55999585.svg" width="160" /></a>
        <a href="https://opensea.io/assets/0x3ca53be299c765cdc66cc1723f8b3eefb3aaa413/9934?ref=0xe3Ca71F5D505937959893CdEFd2704f062E14833" target="_blank" rel="noreferrer"><img src="https://storage.opensea.io/files/9932a81ae30a4785940cbe8df8a61945.svg" width="160" /></a>
      </div>

      <section className="text-center">
        <p>The X,Y Project is a full set of X,Y Coordinates stored on chain, representing a 128x128 grid.</p>
        <p>Use X,Y Project in any way you want. For example: maps, tiles, locations, games, virtual worlds, and more.</p>
      </section>

      <h2 className="text-2xl font-bold text-center">
        All X,Y Project NFTs have been claimed!
      </h2>
    </>
  );
}

export default XYHead;
