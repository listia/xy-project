import useSWR from "swr";
import type { XY } from "../contracts/types";
import useKeepSWRDataLiveAsBlocksArrive from "./useKeepSWRDataLiveAsBlocksArrive";
import useXYContract from "./useXYContract";
import { XYContractAddress } from "../util";

function getXYOwnerOf(contract: XY) {

  return async (_: string, tokenId) => {
    const balance = await contract.ownerOf(tokenId);

    return balance;
  };
}

export default function useXYOwnerOf() {
  const contract = useXYContract(XYContractAddress);
  return async (tokenId) => {
    const result = await contract.ownerOf(tokenId);
    return result;
  }
}
