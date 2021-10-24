import { useWeb3React } from "@web3-react/core";
import useXYTotalSupply from "../hooks/useXYTotalSupply";
import { MAX_SIZE } from "../util";

const XYTotalSupply = ({ handleReload }) => {
  const { account, library } = useWeb3React();
  const isConnected = typeof account === "string" && !!library;

  return (
    <p>
      Total X,Y Coordinates: <b>{MAX_SIZE*MAX_SIZE}</b>
      {isConnected && (
        <>&nbsp;(<a href="#" onClick={e => handleReload(e)}>sync with blockchain</a>)</>
      )}
    </p>
  );
};

export default XYTotalSupply;
