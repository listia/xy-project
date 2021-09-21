import Square from "../components/Square";
import useXYClaim from "../hooks/useXYClaim";
import useXYOwnerOf from "../hooks/useXYOwnerOf";
import { XYContractAddress, MAX_SIZE, getRandomNullIndex } from "../util";
import React, { useState, useReducer, useEffect } from 'react';
import { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import XYTotalSupply from "../components/XYTotalSupply";

const Board = () => {
  const status = 'Loading X,Y Coordinates from Ethereum...';
  const claim = useXYClaim( );
  const ownerOf = useXYOwnerOf();
  const { account } = useWeb3React<Web3Provider>();

  var squaresLoaded = Array(MAX_SIZE*MAX_SIZE).fill(null);
  const [squares, setSquares] = useReducer(reducer, null, function getInitialState(filler) {
    const object = Array(MAX_SIZE*MAX_SIZE).fill(filler);
    return object;
  });

  var rowsLoaded = 0;
  const [rowCount, setRowCount] = useState(0);

  const handleRandomClaim = async () => {
    var tokenId = getRandomNullIndex(squares) + 1; // tokenId is array index + 1
    try {
      if (tokenId >= 0) {
        const sig = await claim((tokenId - 1) % MAX_SIZE, Math.floor((tokenId - 1) / MAX_SIZE));
      } else {
      }
    } catch (error) {
      // Do nothing
    }
  }

  const handleClaim = async (x, y) => {
    try {
      const sig = await claim(x, y);
    } catch (error) {
      // Do nothing
    }
    // TODO: show that square is pending?
    // Can't set squaresLoaded here for some reason. Seems like another copy of it. TBD
  };

  function updateOwners() {
    rowsLoaded = 0;
    for (let y = 0; y < MAX_SIZE; y++) {
      for (let x = 0; x < MAX_SIZE; x++) {
        checkOwner(x,y);
      }
    }
  }

  useEffect(() => {
    // check for new owners after 2 second delay, and then every 10 minutes
    const timer = setTimeout(() => {
      updateOwners();
    }, 2000);
    const checkOwnerInterval = setInterval(() => {
      updateOwners();
    }, 600000);

    // update board UI every 3 seconds
    const boardInterval = setInterval(() => {
      setSquares({ type: 'set', newsquares: squaresLoaded});
      setRowCount(rowsLoaded);
    }, 3000);

    return () => {clearInterval(checkOwnerInterval); clearInterval(boardInterval);}
  }, []);

  function reducer(squares, action) {
    switch (action.type) {
      case 'update':
        squares[action.index] = action.owner;
        return [...squares];
      case 'set':
        return [...action.newsquares];
      default:
        throw new Error();
    }
  }

  const checkOwner = async (x, y) => {
    try {
      const owner = await ownerOf((y*MAX_SIZE) + x + 1);
      if (x == MAX_SIZE-1) {
        rowsLoaded += 1;
      }

      if (owner && squaresLoaded[(y*MAX_SIZE)+x] != owner) {
        squaresLoaded[(y*MAX_SIZE)+x] = owner;
      }
    } catch (error) {
      // x,y token not minted yet, which is ok
      if (String(error).includes("nonexistent token")) {
        if (x == MAX_SIZE-1) {
          rowsLoaded += 1;
        }
      } else { // retry on other errors, such as "failed to fetch"
        checkOwner(x,y);
      }
    }
  }

  function renderSquare(x, y) {
    return <Square x={x} y={y} owner={squares[(y*MAX_SIZE)+x]} handleClaim={handleClaim} />;
  }

  var squaresRendered = [];
  for (var i = 0; i < MAX_SIZE; i++) {
    for (var j = 0; j < MAX_SIZE; j++) {
      squaresRendered.push(renderSquare(j, i));
    }
  }

  return (
    <div>
      {rowCount != MAX_SIZE && (
        <div className="status">
          <p style={{color: "red"}}>
          {status}{rowCount*100/MAX_SIZE}{"%"}<br />
          (Page may be slow while loading on-chain data. Hang tight!)
          </p>
          <button className="ui medium disabled button">
            Can&#39;t decide? Claim a random X,Y Coordinate
          </button>
        </div>
      )}
      {rowCount == MAX_SIZE && (
        <div className="status">
          <XYTotalSupply />
          <button className="ui medium green button" onClick={() => handleRandomClaim()}>
            Can&#39;t decide? Claim a random X,Y Coordinate
          </button>
        </div>
      )}
      <div className="game-board">
        {squaresRendered}
      </div>
    </div>
  );
}

export default Board;
