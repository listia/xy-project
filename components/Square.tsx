import useXYClaim from "../hooks/useXYClaim";
import { XYContractAddress, stringToColor, stringToBorderColor, MAX_SIZE, shortenHex, METAVERSE_COLORS } from "../util";
import { useWeb3React } from "@web3-react/core";

const Square = ({x, y, square, contract, handleClaim, handleToggle, showClickPrompt }) => {
  const { account } = useWeb3React();

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
    <div className={`sq ${square && square.owner ? 'cl' : ''}`} style={square && square.image_uri && !square.image_uri.includes(".mp") ? {backgroundImage: `url(${square.image_uri})`, borderColor: `${contract ? METAVERSE_COLORS[contract].borderColor : ''}`} : {backgroundColor: color, borderColor: borderColor}} onClick={() => handleClick()}>
      <div className="ct tt">
        <div className="ttt">
          <p>({x},{y})</p>
          {square && square.image_uri && !square.image_uri.includes(".mp") && (
            <img src={square.image_uri} width="128" />
          )}
          {!square && showClickPrompt && (
            <p>Click to claim!</p>
          )}
          {square && square.owner && (
            <p>{shortenHex(square.owner, 4)}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Square;
