import useXYWorldContract from "../hooks/useXYWorldContract";
import { XYWorldContractAddress } from "../util";
import useSWR from "swr";
import type { XYWORLD } from "../contracts/types";
import useKeepSWRDataLiveAsBlocksArrive from "./useKeepSWRDataLiveAsBlocksArrive";

export default function useXYWorldPresaleMint() {
  const contract = useXYWorldContract(XYWorldContractAddress);
  
  return async (tokenId, level, proof, price) => {
    var overrideOptions = {
      gasLimit: 160000,
      value: price
    };
    const result = await contract.presaleMint(tokenId, level, proof, overrideOptions);
    return result;
  }
}
