import useXYWorldContract from "../hooks/useXYWorldContract";
import { XYWorldContractAddress } from "../util";
import useSWR from "swr";
import type { XYWorld } from "../contracts/types";
import useKeepSWRDataLiveAsBlocksArrive from "./useKeepSWRDataLiveAsBlocksArrive";

export default function useXYWorldBatchMint() {
  const contract = useXYWorldContract(XYWorldContractAddress);

  return async (tokenIds, level, price) => {
    var overrideOptions = {
      gasLimit: 80000 + (80000 * tokenIds.length),
      value: price
    };
    const result = await contract.batchMint(tokenIds, level, overrideOptions);
    return result;
  }
}
