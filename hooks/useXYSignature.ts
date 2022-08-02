import type { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import { useEffect, useState } from "react";
import { XY_WORLD_SIGNATURE_MSG } from "../util";

export default function useXYSignature(address: string) {
  const { library, chainId } = useWeb3React<Web3Provider>();
  const [signature, setSignature] = useState("");

  useEffect(() => {
    if (library && typeof address === "string") {
      let stale = false;

      library
        .getSigner(address)
        .signMessage(XY_WORLD_SIGNATURE_MSG)
        .then((signature: any) => {
          if (!stale && typeof signature === "string") {
            setSignature(signature);
          }
        })
        .catch((error: any) => {
          setSignature("cancelled");
        })

      return () => {
        stale = true;
        setSignature("");
      };
    }
  }, [library, address, chainId]);

  return signature;
}
