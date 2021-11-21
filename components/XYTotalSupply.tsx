import { useWeb3React } from "@web3-react/core";
import useXYTotalSupply from "../hooks/useXYTotalSupply";
import { MAX_SIZE } from "../util";
import { RefreshIcon } from "@heroicons/react/solid";

const XYTotalSupply = ({ contract, handleReload }) => {
  const { account, library } = useWeb3React();
  const isConnected = typeof account === "string" && !!library;

  return (
    <p className="inline-flex items-center">
      Total X,Y Coordinates:&nbsp;<b>{MAX_SIZE*MAX_SIZE}</b>
      {isConnected && (
        <>
          &nbsp;(<a href="#" className="inline-flex items-center" onClick={e => handleReload(e)}><RefreshIcon className="h-4 w-4" aria-hidden="true" /> with blockchain</a>)
        </>
      )}
    </p>
  );
};

export default XYTotalSupply;
