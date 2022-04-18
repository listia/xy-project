import { useWeb3React } from "@web3-react/core";
import useXYTotalSupply from "../hooks/useXYTotalSupply";
import { MAX_SIZE } from "../util";
import { RefreshIcon } from "@heroicons/react/solid";
import Link from "next/link";

const XYTotalSupply = ({ contract, handleReload }) => {
  const { account, library } = useWeb3React();
  const isConnected = typeof account === "string" && !!library;

  return (
    <>
      <p className="inline-flex items-center">
        Total X,Y Coordinates:&nbsp;<b>{MAX_SIZE*MAX_SIZE}</b>
        {isConnected && (
          <>
            &nbsp;(<a href="#" className="inline-flex items-center" onClick={e => handleReload(e)}><RefreshIcon className="h-4 w-4" aria-hidden="true" /> with blockchain</a>)
          </>
        )}
      </p>
      <h4 className="font-medium">
        Filter the GRID:&nbsp;&nbsp;
        <Link href="/">X,Y Project</Link>&nbsp;&nbsp;&#183;&nbsp;&nbsp;
        <Link href="/XYWorld">X,Y World</Link>&nbsp;&nbsp;&#183;&nbsp;&nbsp;
        <Link href="/NFTWorlds">NFT Worlds</Link>&nbsp;&nbsp;&#183;&nbsp;&nbsp;
        <Link href="/Metroverse">Metroverse</Link>&nbsp;&nbsp;&#183;&nbsp;&nbsp;
        <Link href="/KaijuKingz">Kaiju Kingz</Link>&nbsp;&nbsp;&#183;&nbsp;&nbsp;
        more soon...
      </h4>
    </>
  );
};

export default XYTotalSupply;
