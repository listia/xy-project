import useSWR from "swr";
import type { XY } from "../contracts/types";
import useKeepSWRDataLiveAsBlocksArrive from "./useKeepSWRDataLiveAsBlocksArrive";
import useXYContract from "./useXYContract";

function getXYTotalSupply(contract: XY) {
  return async (_: string, address: string) => {
    const balance = await contract.totalSupply();

    return balance;
  };
}

export default function useXYTotalSupply(
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
    shouldFetch ? ["XYTotalSupply", address, contractAddress] : null,
    getXYTotalSupply(contract),
    {
      suspense,
    }
  );

  useKeepSWRDataLiveAsBlocksArrive(result.mutate);

  return result;
}
