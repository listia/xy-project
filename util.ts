import type { BigNumberish } from "@ethersproject/bignumber";
import { formatUnits } from "@ethersproject/units";

const RINKEBY_CONTRACT="0xB040Fb7475650Ec41d15f5df2d723096968BB7ce";
const MAINNET_CONTRACT="0x3CA53BE299C765cDC66cC1723F8B3EEFB3aAa413";

export const XYContractAddress = MAINNET_CONTRACT;
export const MAX_SIZE = 128;

export function shortenHex(hex: string, length = 4) {
  return `${hex.substring(0, length + 2)}…${hex.substring(
    hex.length - length
  )}`;
}

const ETHERSCAN_PREFIXES = {
  1: "",
  3: "ropsten.",
  4: "rinkeby.",
  5: "goerli.",
  42: "kovan.",
};

export const METAVERSE = {
  "NFTWorlds": {name: "NFT Worlds", link: "https://opensea.io/collection/nft-worlds?ref=0xe3Ca71F5D505937959893CdEFd2704f062E14833", contract: "0xBD4455dA5929D5639EE098ABFaa3241e9ae111Af"}
};

export const METAVERSE_COLORS = {
  "0xBD4455dA5929D5639EE098ABFaa3241e9ae111Af": {borderColor: "#2A2A2A", claimedColor: "#005EB8"}
};

export function formatEtherscanLink(
  type: "Account" | "Transaction",
  data: [number, string]
) {
  switch (type) {
    case "Account": {
      const [chainId, address] = data;
      return `https://${ETHERSCAN_PREFIXES[chainId]}etherscan.io/address/${address}`;
    }
    case "Transaction": {
      const [chainId, hash] = data;
      return `https://${ETHERSCAN_PREFIXES[chainId]}etherscan.io/tx/${hash}`;
    }
  }
}

// From: https://stackoverflow.com/questions/3426404/create-a-hexadecimal-colour-based-on-a-string-with-javascript
export function stringToColor(str, contract) {
    if (str == null) {
      return "#1da045"
    }
    if (contract) {
      return METAVERSE_COLORS[contract].claimedColor;
    }
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    var color = '#';
    for (var i = 0; i < 3; i++) {
        var value = (hash >> (i * 8)) & 0xFF;
        color += ('00' + value.toString(16)).substr(-2);
    }
    return color;
}

export function stringToBorderColor(str, contract) {
    if (str == null) {
      return "#108e36"
    }
    if (contract) {
      return METAVERSE_COLORS[contract].claimedColor;
    }
    return "#2A2A2A";
}

// Returns a random index from the array where the value is null
// Or -1 if none are found
export function getRandomNullIndex(arr) {
  var randomIndex = Math.floor(Math.random() * arr.length);

  var i = randomIndex;
  while (true) {
    if (arr[i] == null) {
      return i;
    } else {
      // move forward or wrap around
      if (i < arr.length-1) {
        i++;
      } else {
        i = 0;
      }
    }
    // fully wrapped around, no nulls are found
    if (i == randomIndex) {
      return -1;
    }
  }

  return i;
}

export const parseBalance = (
  value: BigNumberish,
  decimals = 18,
  decimalsToDisplay = 3
) => parseFloat(formatUnits(value, decimals)).toFixed(decimalsToDisplay);
