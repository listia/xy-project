import Square from "../components/Square";
import useXYClaim from "../hooks/useXYClaim";
import useXYOwnerOf from "../hooks/useXYOwnerOf";
import { XYContractAddress, MAX_SIZE, getRandomNullIndex } from "../util";
import React, { useState, useReducer, useEffect } from 'react';
import { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import XYTotalSupply from "../components/XYTotalSupply";
import * as rax from 'retry-axios';
import axios from "axios";

const Board = () => {
  const claim = useXYClaim( );
  const ownerOf = useXYOwnerOf();

  const { account, library } = useWeb3React();
  const isConnected = typeof account === "string" && !!library;

  const getBoardURL = '/api/getBoard';
  const updateCoordinateURL = '/api/updateCoordinate';

  var squaresLoaded = Array(MAX_SIZE*MAX_SIZE).fill(null);
  const [squares, setSquares] = useReducer(reducer, null, function getInitialState(filler) {
    const object = Array(MAX_SIZE*MAX_SIZE).fill(filler);
    return object;
  });

  var rowsLoaded = 0;
  const [rowCount, setRowCount] = useState(0);

  const [checkOwnerInterval, setCheckOwnerInterval] = useState(null);

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

  const loadCachedBoard = async () => {
    const interceptorId = rax.attach(); // retry logic for axios
    axios({
      method: 'GET',
      url: getBoardURL,
      raxConfig: {
        retry: 10
      }
    }).then((response) => {
      // @ts-ignore
      response.data.coordinates.map((coordinate) => {
        // indexes into coordinate array
        // 0: token_id
        // 1: owner
        // 2: color
        // 3: image_uri
        squaresLoaded[coordinate[0]] = coordinate[1];
      });

      // update the UI right away after cached board is loaded
      rowsLoaded = MAX_SIZE;
      updateSquares();

      // sync with on-chain data soon after cached board is loaded
      setTimeout(() => {
        updateOwners();
      }, 30000);

      // also check for new owners every 10 minutes
      const intervalId = setInterval(() => {
        updateOwners();
      }, 600000);
      setCheckOwnerInterval(intervalId);
    }).catch(error => {
      console.log(error);
    })
  };

  const updateCachedCoordinate = async (tokenId, owner) => {
    axios({
      method: 'POST',
      url: updateCoordinateURL,
      data: {
        token_id: tokenId,
        owner: owner
      },
    }).then((response) => {
      console.log("updateCachedCoordinate result: " + JSON.stringify(response.data, null, 2))
    }).catch(error => {
      console.log(error);
    })
  };

  function updateOwners() {
    if (isConnected) {
      rowsLoaded = 0;
      for (let y = 0; y < MAX_SIZE; y++) {
        for (let x = 0; x < MAX_SIZE; x++) {
          checkOwner(x,y);
        }
      }
    }
  }

  function updateSquares() {
    setSquares({ type: 'set', newsquares: squaresLoaded});
    setRowCount(rowsLoaded);
  }

  useEffect(() => {
    // don't load right away, in case metamask is connecting
    // TODO: make this deterministic, so it waits for
    // metamask to connect or not
    const loadTimeout = setTimeout(() => {
      loadCachedBoard();
    }, 5000);

    // update board UI every 3 seconds
    const boardInterval = setInterval(() => {
      updateSquares();
    }, 3000);

    return () => {
      clearInterval(boardInterval);
      clearInterval(checkOwnerInterval);
      clearTimeout(loadTimeout);
    }
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
        updateCachedCoordinate((y*MAX_SIZE)+x, owner);
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
    return <Square x={x} y={y} owner={squares[(y*MAX_SIZE)+x]} handleClaim={handleClaim} key={`sq-${x}-${y}`} />;
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
            Updating X,Y Coordinates...{rowCount*100/MAX_SIZE}{"%"}<br />
            (Page may be slow while loading on-chain data. Hang tight!)
          </p>
          {isConnected && (
            <button className="ui medium disabled button">
              Can&#39;t decide? Claim a random X,Y Coordinate
            </button>
          )}
        </div>
      )}
      {isConnected && rowCount == MAX_SIZE && (
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
