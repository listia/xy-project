import XYWORLD_ABI from "../contracts/XYWorld.json";
import type { XYWORLD } from "../contracts/types";
import useContract from "./useContract";

export default function useXYWorldContract(contractAddress?: string) {
  return useContract<XYWORLD>(contractAddress, XYWORLD_ABI);
}
