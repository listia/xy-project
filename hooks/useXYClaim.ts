import useXYContract from "../hooks/useXYContract";
import { XYContractAddress } from "../util";
import useSWR from "swr";
import type { XY } from "../contracts/types";
import useKeepSWRDataLiveAsBlocksArrive from "./useKeepSWRDataLiveAsBlocksArrive";

export default function useXYClaim() {
  const contract = useXYContract(XYContractAddress);

  return async (x, y) => {
    const result = await contract.claim(x, y);
    return result;
  }
}
