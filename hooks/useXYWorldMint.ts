import useXYWorldContract from "../hooks/useXYWorldContract";
import { XYWorldContractAddress } from "../util";
import useSWR from "swr";
import type { XYWorld } from "../contracts/types";
import useKeepSWRDataLiveAsBlocksArrive from "./useKeepSWRDataLiveAsBlocksArrive";

export default function useXYWorldMint() {
  const contract = useXYWorldContract(XYWorldContractAddress);
  
  return async (tokenId, level, price) => {
    var overrideOptions = {
      gasLimit: 160000,
      value: price
    };
    const result = await contract.mint(tokenId, level, overrideOptions);
    return result;
  }
}
