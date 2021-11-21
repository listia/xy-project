import useXYClaim from "../hooks/useXYClaim";
import { XYContractAddress, stringToColor, stringToBorderColor, MAX_SIZE, shortenHex, metaverseColors } from "../util";
import { useWeb3React } from "@web3-react/core";

const Square = ({edit, moving, x, y, square, contract, handleToggle, handleMove }) => {
  let { account } = useWeb3React();

  let img = square && square.image_uri ? square.image_uri : ""
  if (square && square.image_uri) {
    // don't show moview files
    if (square.image_uri.includes(".mp4") || square.image_uri.includes(".mov") || square.image_uri.includes(".webm")) {
      img = ""
    }
    // when editing, only show tokens the account owns
    else if (edit && square && (account !== square.token_owner)) {
      img = ""
    }
  }

  let description = square && square.owner ? shortenHex(square.owner, 4) : ""
  // prompt about moving
  if (edit && moving === -1 && square && (account === square.token_owner)) {
    description = "Click to move NFT"
  }
  // your spots (with someone else's token on it)
  else if (edit && square && (account === square.owner)) {
    description = "Available (yours)"
  }
  // empty spots
  else if (edit && square && !square.image_uri) {
    description = "Available"
  }
  // show token owner's address (not XY owner)
  else if (contract && square && square.token_owner) {
    description = shortenHex(square.token_owner, 4)
  }

  let color = square && square.color ? square.color : stringToColor(square ? square.owner : null, contract);
  // editing and there is a token on this spot, show as "taken"
  if (edit && square && square.image_uri) {
    color = metaverseColors(contract).borderColor
  }

  let borderColor = square && square.color ? square.color : stringToBorderColor(square ? square.owner : null, contract);
  // moving this coordinate, highlight it
  if (square && moving === ((y*MAX_SIZE) + x)) {
    borderColor = "#e9e9e9"
  }
  // moving and account owns this XY spot, show as owned by account
  else if (moving !== -1 && square && (account === square.owner)) {
    borderColor = "#63b3ed"
  }
  // special metaverse colors
  else if (img && contract) {
    borderColor = metaverseColors(contract).borderColor
  }
  else if (img && !contract) {
    borderColor = ''
  }

  function handleClick() {
    // editing mode
    if (edit) {
      if (square && (account === square.token_owner || account === square.owner || !square.token_owner)) {
        handleMove(x, y);
      }
    } else {
      // clicking on own coordinates
      if (!contract && square && square.owner == account) {
        handleToggle(x, y);
      // view other squares on opensea
      } else if (contract && square && square.token_owner) {
        window.open("https://opensea.io/assets/" + contract + "/" + square.token_id + "?ref=0xe3Ca71F5D505937959893CdEFd2704f062E14833");
      } else if (square && square.owner) {
        window.open("https://opensea.io/assets/0x3ca53be299c765cdc66cc1723f8b3eefb3aaa413/" + ((y*MAX_SIZE) + x + 1) + "?ref=0xe3Ca71F5D505937959893CdEFd2704f062E14833");
      }
    }
  }

  return (
    <div data-for='squaretip'
         data-tip={`(${x},${y})|${img}|${description}`}
         className={`sq ${square && square.owner ? 'cl' : ''}`}
         style={img != "" ? {backgroundImage: `url(${img})`, borderColor: borderColor} : {backgroundColor: color, borderColor: borderColor}}
         onClick={() => handleClick()}>
    </div>
  );
};

export default Square;
