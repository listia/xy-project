import useSWR from "swr";
import type { XY } from "../contracts/types";
import useKeepSWRDataLiveAsBlocksArrive from "./useKeepSWRDataLiveAsBlocksArrive";
import useXYContract from "./useXYContract";

function getXYBalance(contract: XY) {
  return async (_: string, address: string) => {
    const balance = await contract.balanceOf(address);

    return balance;
  };
}

export default function useXYBalance(
  address: string,
  contractAddress: string,
  suspense = false
) {
  
  const contract = useXYContract(contractAddress);

  const shouldFetch =
    typeof address === "string" &&
    typeof contractAddress === "string" &&
    !!contract;

  const result = useSWR(
    shouldFetch ? ["XYBalance", address, contractAddress] : null,
    getXYBalance(contract),
    {
      suspense,
    }
  );

  useKeepSWRDataLiveAsBlocksArrive(result.mutate);

  return result;
}
