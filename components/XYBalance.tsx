import type { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import useXYBalance from "../hooks/useXYBalance";
import { parseBalance, XYContractAddress } from "../util";

const XYBalance = () => {
  const { account } = useWeb3React<Web3Provider>();
  const { data } = useXYBalance(account, XYContractAddress);

  if (data) {
    return <p>Coordinates in Your Wallet: <b>{parseBalance(data ?? 0, 0, 0)} XYC</b><br/>(Click on a coordinate you own to rotate NFTs from your wallet)</p>;
  }
  else {
    return <p>Loading Your Coordinates...</p>;
  }
};

export default XYBalance;
