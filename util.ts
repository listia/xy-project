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
  "NFTWorlds": {
    name: "NFT Worlds",
    link: "https://opensea.io/collection/nft-worlds?ref=0xe3Ca71F5D505937959893CdEFd2704f062E14833",
    contract: "0xBD4455dA5929D5639EE098ABFaa3241e9ae111Af"
  },
  "BAYC": {
    name: "Bored Ape Yacht Club",
    link: "https://opensea.io/collection/boredapeyachtclub?ref=0xe3Ca71F5D505937959893CdEFd2704f062E14833",
    contract: "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D"
  },
  "MAYC": {
    name: "Mutant Ape Yacht Club",
    link: "https://opensea.io/collection/mutant-ape-yacht-club?ref=0xe3Ca71F5D505937959893CdEFd2704f062E14833",
    contract: "0x60E4d786628Fea6478F785A6d7e704777c86a7c6"
  },
  "CryptoPunks": {
    name: "CryptoPunks",
    link: "https://opensea.io/collection/cryptopunks?ref=0xe3Ca71F5D505937959893CdEFd2704f062E14833",
    contract: "0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB"
  },
  "CryptoKitties": {
    name: "CryptoKitties",
    link: "https://opensea.io/collection/cryptokitties?ref=0xe3Ca71F5D505937959893CdEFd2704f062E14833",
    contract: "0x06012c8cf97BEaD5deAe237070F9587f8E7A266d"
  },
  "KaijuKingz": {
    name: "Kaiju Kingz",
    link: "https://opensea.io/collection/kaiju-kingz?ref=0xe3Ca71F5D505937959893CdEFd2704f062E14833",
    contract: "0x0c2E57EFddbA8c768147D1fdF9176a0A6EBd5d83"
  },
  "nproject": {
    name: "The n project",
    link: "https://opensea.io/collection/n-project?ref=0xe3Ca71F5D505937959893CdEFd2704f062E14833",
    contract: "0x05a46f1E545526FB803FF974C790aCeA34D1f2D6"
  },
};

// Custom metaverse color schemes
export const METAVERSE_COLORS = {
  "0xBD4455dA5929D5639EE098ABFaa3241e9ae111Af": {borderColor: "#2A2A2A", claimedColor: "#005EB8", claimedBorderColor: "#005EB8"},
};

export function metaverseColors(contract) {
  if(METAVERSE_COLORS[contract]) {
    return METAVERSE_COLORS[contract];
  }
  // Default color scheme
  return {borderColor: "#2A2A2A", claimedColor: "#3a3a3a", claimedBorderColor: "#2A2A2A"};
}

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
      return "#3a3a3a"
    }
    if (contract) {
      return metaverseColors(contract).claimedColor;
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
      return "#2A2A2A"
    }
    if (contract) {
      return metaverseColors(contract).claimedBorderColor;
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
