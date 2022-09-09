import XYWORLD_ABI from "../contracts/XYWorld.json";
import type { XYWorld } from "../contracts/types";
import useContract from "./useContract";

export default function useXYWorldContract(contractAddress?: string) {
  return useContract<XYWorld>(contractAddress, XYWORLD_ABI);
}
