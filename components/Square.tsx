import useXYClaim from "../hooks/useXYClaim";
import { XYContractAddress, stringToColor, stringToBorderColor, MAX_SIZE, shortenHex, METAVERSE_COLORS } from "../util";
import { useWeb3React } from "@web3-react/core";

const Square = ({x, y, square, contract, handleClaim, handleToggle, showClickPrompt }) => {
  const { account } = useWeb3React();
  const img = square && square.image_uri && !square.image_uri.includes(".mp4") && !square.image_uri.includes(".mov") && !square.image_uri.includes(".webm") ? square.image_uri : ""
  const description = !square && showClickPrompt ? "Click to claim!" : (square && square.owner ? shortenHex(square.owner, 4) : "")
  const color = square && square.color ? square.color : stringToColor(square ? square.owner : null, contract);
  const borderColor = square && square.color ? square.color : stringToBorderColor(square ? square.owner : null, contract);

  function handleClick() {
    if (square && square.owner == account) {
      handleToggle(x, y);
    } else if (square && square.owner) {
      window.open("https://opensea.io/assets/0x3ca53be299c765cdc66cc1723f8b3eefb3aaa413/" + ((y*MAX_SIZE) + x + 1)) + "?ref=0xe3Ca71F5D505937959893CdEFd2704f062E14833";
    } else {
      handleClaim(x, y);
    }
  }
  return (
    <div data-for='squaretip'
         data-tip={`(${x},${y})|${img}|${description}`}
         className={`sq ${square && square.owner ? 'cl' : ''}`}
         style={img != "" ? {backgroundImage: `url(${img})`, borderColor: `${contract ? METAVERSE_COLORS[contract].borderColor : ''}`} : {backgroundColor: color, borderColor: borderColor}}
         onClick={() => handleClick()}>
    </div>
  );
};

export default Square;
