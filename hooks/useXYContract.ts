import XY_ABI from "../contracts/XY.json";
import type { XY } from "../contracts/types";
import useContract from "./useContract";

export default function useXYContract(contractAddress?: string) {
  return useContract<XY>(contractAddress, XY_ABI);
}
