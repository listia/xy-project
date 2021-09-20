import type { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import useETHBalance from "../hooks/useETHBalance";
import { parseBalance } from "../util";

const ETHBalance = () => {
  const { account } = useWeb3React<Web3Provider>();
  const { data } = useETHBalance(account);

  if (data) {
    return <p>Your ETH Balance: <b>Ξ{parseBalance(data ?? 0)}</b></p>;
  }
  else {
    return <p>Loading Your ETH Balance...</p>;
  }
};

export default ETHBalance;
