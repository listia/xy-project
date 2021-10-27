import MetaMaskOnboarding from "@metamask/onboarding";
import { useWeb3React } from "@web3-react/core";
import { UserRejectedRequestError } from "@web3-react/injected-connector";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { injected } from "../connectors";
import useENSName from "../hooks/useENSName";
import { formatEtherscanLink, shortenHex, stringToColor } from "../util";

type Props = {
  triedToEagerConnect: boolean;
};

const Account = ({ triedToEagerConnect }: Props) => {
  const {
    active,
    error,
    activate,
    chainId,
    account,
    setError,
  } = useWeb3React();

  // initialize metamask onboarding
  const onboarding = useRef<MetaMaskOnboarding>();

  useEffect(() => {
    onboarding.current = new MetaMaskOnboarding();
  }, []);

  // manage connecting state for injected connector
  const [connecting, setConnecting] = useState(false);
  useEffect(() => {
    if (active || error) {
      setConnecting(false);
      onboarding.current?.stopOnboarding();
    }
  }, [active, error]);

  const ENSName = useENSName(account);

  if (error) {
    return null;
  }

  if (!triedToEagerConnect) {
    return null;
  }

  if (typeof account !== "string") {
    const hasMetaMaskOrWeb3Available =
      MetaMaskOnboarding.isMetaMaskInstalled() ||
      (window as any)?.ethereum ||
      (window as any)?.web3;

    return (
      <>
        {hasMetaMaskOrWeb3Available ? (
          <button className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-og-green hover:bg-og-green-dark text-white"
            onClick={() => {
              setConnecting(true);

              activate(injected, undefined, true).catch((error) => {
                // ignore the error if it's a user rejected request
                if (error instanceof UserRejectedRequestError) {
                  setConnecting(false);
                } else {
                  setError(error);
                }
              });
            }}
          >
            {MetaMaskOnboarding.isMetaMaskInstalled()
              ? "Connect to MetaMask"
              : "Connect to Wallet"}
          </button>
        ) : (
          <button className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-og-green hover:bg-og-green-dark text-white" onClick={() => onboarding.current?.startOnboarding()}>
            Install Metamask
          </button>
        )}
      </>
    );
  }

  return (
    <p>
      <a
        {...{
          href: formatEtherscanLink("Account", [chainId, account]),
          target: "_blank",
          rel: "noopener noreferrer",
        }}
      >
        <span className="border box-border border-black" style={{backgroundColor: stringToColor(account, null)}}>
          &nbsp; &nbsp; &nbsp;
        </span>
        &nbsp;
        {ENSName || account}
      </a>
    </p>
  );
};

export default Account;
