import type { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import useXYTotalSupply from "../hooks/useXYTotalSupply";
import { parseBalance, XYContractAddress, MAX_SIZE } from "../util";

const XYTotalSupply = () => {
  const { account } = useWeb3React<Web3Provider>();
  const { data } = useXYTotalSupply(account, XYContractAddress);

  return (
    <p>
      Total Claimed Coordinates: <b>{parseBalance(data ?? 0, 0, 0)}/{MAX_SIZE*MAX_SIZE}</b><br />
      (Click an empty square <span className="border box-border border-og-green-dark bg-og-green">&nbsp; &nbsp; &nbsp;</span> to claim. On-chain data may change at any time and transactions may fail.)
    </p>
  );
};

export default XYTotalSupply;
