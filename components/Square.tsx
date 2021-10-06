import useXYClaim from "../hooks/useXYClaim";
import { XYContractAddress, stringToColor, MAX_SIZE, shortenHex } from "../util";
import { useWeb3React } from "@web3-react/core";

const Square = ({x, y, square, handleClaim, handleToggle }) => {
  const { account } = useWeb3React();

  const color = square && square.color ? square.color : stringToColor(square ? square.owner : null);
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
      <div className={`square ${square && square.owner ? 'claimed' : ''}`} style={square && square.image_uri ? {backgroundImage: `url(${square.image_uri})`} : {backgroundColor: color}} onClick={() => handleClick()}>
        <div className="content tooltip">
          <span className="tooltiptext">
            ({x},{y})
            <br/>
            {square && square.image_uri && (
              <>
              <img src={square.image_uri} width="128" />
              <br/>
              </>
            )}
            {`${square && square.owner ? shortenHex(square.owner, 5) : ''}`}</span>
        </div>
      </div>
    );
};

export default Square;
