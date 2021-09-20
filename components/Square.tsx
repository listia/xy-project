import useXYClaim from "../hooks/useXYClaim";
import { XYContractAddress, stringToColor, MAX_SIZE, shortenHex } from "../util";

const Square = ({x, y, owner, handleClaim }) => {
  const color = stringToColor(owner);
  function handleClick() {
    if (owner) {
      window.open("https://opensea.io/assets/0x3ca53be299c765cdc66cc1723f8b3eefb3aaa413/" + ((y*MAX_SIZE) + x + 1)) + "?ref=0xe3Ca71F5D505937959893CdEFd2704f062E14833";
    } else {
      handleClaim(x, y);
    }
  }
  return (
      <div className={`square ${owner ? 'claimed' : ''}`} style={{backgroundColor: color}} onClick={() => handleClick()}>
        <div className="content tooltip">
          <span className="tooltiptext">({x},{y})<br/>{`${owner ? shortenHex(owner, 3) : ''}`}</span>
        </div>
      </div>
    );
};

export default Square;
