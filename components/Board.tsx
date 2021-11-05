import { useRouter } from 'next/router'
import Squares from "../components/Squares";
import useXYOwnerOf from "../hooks/useXYOwnerOf";
import { XYContractAddress, MAX_SIZE, getRandomNullIndex } from "../util";
import React, { useState, useReducer, useEffect } from 'react';
import { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import XYTotalSupply from "../components/XYTotalSupply";
import * as rax from 'retry-axios';
import axios from "axios";

const Board = (props) => {
  const router = useRouter()
  const [selectZoom, setSelectZoom] = useState(props.zoom ? props.zoom : 1)
  const [selectX, setSelectX] = useState(props.x ? props.x : 0)
  const [selectY, setSelectY] = useState(props.y ? props.y : 0)
  const metaverse = props.metaverse

  const ownerOf = useXYOwnerOf();

  const { account } = useWeb3React<Web3Provider>();

  const getCachedAssetsURL = '/api/getCachedAssets';
  const getBoardURL = '/api/getBoard';
  const getBoardAssetsURL = '/api/getBoardAssets';
  const updateCoordinateURL = '/api/updateCoordinate';
  const updateAssetsURL = '/api/updateAssets';

  const [squares, setSquares] = useReducer(squaresReducer, null, function getInitialState(filler) {
    const object = Array(MAX_SIZE*MAX_SIZE).fill(filler);
    return object;
  });
  // this is used to tell when squares is updated, since updating it creates a shallow copy
  // and always looks the same when passed into the Memoized Squares component
  const [squaresUpdatedAt, setSquaresUpdatedAt] = useState(0);

  const [rows, setRows] = useReducer(rowsReducer, {count: MAX_SIZE});

  const [assetCount, setAssetCount] = useState(0);

  const [loadingBoard, setLoadingBoard] = useState(true);

  var cachedAssets = []

  function squaresReducer(squares, action) {
    switch (action.type) {
      case 'update':
        if (squares[action.index] == null) {
          squares[action.index] = {}
        }
        squares[action.index].owner = action.owner;
        squares[action.index].color = action.color;
        squares[action.index].image_uri = action.image_uri;
        return [...squares];
      case 'set':
        return [...action.newsquares];
      default:
        throw new Error();
    }
  }

  function rowsReducer(state, action) {
    switch (action.type) {
        case 'increment':
          return {count: state.count + 1};
        case 'decrement':
          return {count: state.count - 1};
        case 'reset':
          return {count: action.count};
        default:
          throw new Error();
      }
  }

  const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
  }

  const handleReload = async (e) => {
    e.preventDefault();
    setRows({type: 'reset', count: 0})
    updateOwners();
  }

  // toggle image on the square
  const handleToggle = async (x, y) => {
    let response = await axios({
      method: 'GET',
      url: getCachedAssetsURL,
      params: { owner: account,
                contract: props.contract},
      raxConfig: {
        retry: 2
      }
    });
    // @ts-ignore
    let assets = response.data.assets;
    if (assets) {
      setAssetCount(assetCount + 1);
      if (assetCount >= assets.length || !assets[assetCount]) {
        setAssetCount(0);
      }
      if (assets[assetCount]) {
        setSquares({ type: 'update',
                     index: (y*MAX_SIZE)+x,
                     owner: squares[(y*MAX_SIZE)+x].owner,
                     color: squares[(y*MAX_SIZE)+x].color,
                     image_uri: assets[assetCount].image_uri});
        setSquaresUpdatedAt(Date.now());
        updateCachedCoordinate((y*MAX_SIZE)+x,
                               squares[(y*MAX_SIZE)+x].owner,
                               squares[(y*MAX_SIZE)+x].color,
                               squares[(y*MAX_SIZE)+x].image_uri);
      }
    }
  };

  const loadCachedAssets = async (squareIndex, owner) => {
    let assets = []
    let cachedOwner = cachedAssets.find(x=>x.owner===owner);
    if (!cachedOwner) {
      const interceptorId = rax.attach(); // retry logic for axios
      await axios({
        method: 'GET',
        url: getCachedAssetsURL,
        params: { owner: owner,
                  contract: props.contract},
        raxConfig: {
          retry: 2
        }
      }).then((response) => {
        // @ts-ignore
        assets = response.data.assets;
        cachedAssets.push({owner: owner, assets: assets});
      }).catch(error => {
        console.log(error);
      })
    }
    else {
      assets = cachedOwner.assets;
    }
    if (assets && assets.length > 0) {
      if (squares[squareIndex] == null) {
        squares[squareIndex] = {}
      }
      let image_uri = assets[Math.floor(Math.random()*assets.length)].image_uri
      setSquares({ type: 'update',
                   index: squareIndex,
                   owner: squares[squareIndex].owner,
                   color: squares[squareIndex].color,
                   image_uri: image_uri });
      setSquaresUpdatedAt(Date.now());
      updateCachedCoordinate(squareIndex,
                             squares[squareIndex].owner,
                             squares[squareIndex].color,
                             image_uri);
    }
  };

  // fetch and cache assets for this user (from Opensea)
  const updateAssets = async (owner) => {
    const interceptorId = rax.attach(); // retry logic for axios
    await axios({
      method: 'POST',
      url: updateAssetsURL,
      data: {
        owner: owner
      },
      raxConfig: {
        retry: 2
      }
    }).then((response) => {
      console.log(response);
    }).catch(error => {
      console.log(error);
    })
  };

  const loadCachedBoard = async () => {
    const interceptorId = rax.attach(); // retry logic for axios
    axios({
      method: 'GET',
      url: getBoardURL,
      raxConfig: {
        retry: 10
      }
    }).then((boardResponse) => {
      if (props.contract) {
        axios({
          method: 'GET',
          url: getBoardAssetsURL,
          params: { contract: props.contract },
          raxConfig: {
            retry: 10
          }
        }).then((assetsResponse) => {
          // use a temp variable for faster loading
          var squaresLoaded = Array(MAX_SIZE*MAX_SIZE).fill(null);
          // @ts-ignore
          boardResponse.data.coordinates.map((coordinate) => {
            // indexes into coordinate array
            // 0: token_id
            // 1: owner
            // 2: color
            // indexes into assets array
            // 0: token_id
            // 1: image_uri
            // @ts-ignore
            let asset = assetsResponse.data.coordinates.find(x => x[0] === coordinate[0])
            squaresLoaded[coordinate[0]] = {"owner": coordinate[1],
                                            "color": coordinate[2],
                                            "image_uri": asset && asset[1] ? asset[1] : null};
          });
          setSquares({ type: 'set', newsquares: squaresLoaded});
          setSquaresUpdatedAt(Date.now());
        }).catch(error => {
          console.log(error);
        })
      }
      else {
        // use a temp variable for faster loading
        var squaresLoaded = Array(MAX_SIZE*MAX_SIZE).fill(null);
        // @ts-ignore
        boardResponse.data.coordinates.map((coordinate) => {
          squaresLoaded[coordinate[0]] = {"owner": coordinate[1],
                                          "color": coordinate[2],
                                          "image_uri": coordinate[3]};
        });
        setSquares({ type: 'set', newsquares: squaresLoaded});
        setSquaresUpdatedAt(Date.now());
      }

      // update squares state
      setRows({type: 'reset', count: MAX_SIZE})
      setLoadingBoard(false);
    }).catch(error => {
      console.log(error);
    })
  };

  const updateCachedCoordinate = async (tokenId, owner, color, image_uri) => {
    axios({
      method: 'POST',
      url: updateCoordinateURL,
      data: {
        token_id: tokenId,
        owner: owner,
        color: color,
        image_uri: image_uri,
        contract: props.contract
      },
    }).then((response) => {
      console.log("updateCachedCoordinate result: " + JSON.stringify(response.data, null, 2))
    }).catch(error => {
      console.log(error);
    })
  };

  const initCachedAssets = async () => {
    setRows({type: 'reset', count: 0})
    for (let y = 0; y < MAX_SIZE; y++) {
      for (let x = 0; x < MAX_SIZE; x++) {
        let square = squares[(y*MAX_SIZE)+x];
        if (square && square.owner && !square.image_uri) {
          loadCachedAssets((y*MAX_SIZE)+x, square.owner);
        }
        if (x == MAX_SIZE-1) {
          setRows({type: 'increment'})
        }
        await sleep(5);
      }
    }
  }

  const updateOwners = async () => {
    setRows({type: 'reset', count: 0})
    for (let y = 0; y < MAX_SIZE; y++) {
      for (let x = 0; x < MAX_SIZE; x++) {
        checkOwner(x,y);
        await sleep(5);
      }
    }
  }

  const checkOwner = async (x, y) => {
    try {
      const owner = await ownerOf((y*MAX_SIZE) + x + 1);
      if (x == MAX_SIZE-1) {
        setRows({type: 'increment'})
      }
      // NEW owner found
      if (owner && (squares[(y*MAX_SIZE)+x] == null || squares[(y*MAX_SIZE)+x].owner != owner)) {
        if (squares[(y*MAX_SIZE)+x] == null) {
          squares[(y*MAX_SIZE)+x] = {}
        }
        setSquares({ type: 'update',
                     index: (y*MAX_SIZE)+x,
                     owner: owner,
                     color: null,
                     image_uri: ""});
        setSquaresUpdatedAt(Date.now());
        updateCachedCoordinate((y*MAX_SIZE)+x,
                               owner,
                               squares[(y*MAX_SIZE)+x].color,
                               squares[(y*MAX_SIZE)+x].image_uri);
        await updateAssets(owner);
        loadCachedAssets((y*MAX_SIZE)+x, owner);
      }
      // EXISTING owner, but no image set yet
      else if (owner && !squares[(y*MAX_SIZE)+x].image_uri) {
        loadCachedAssets((y*MAX_SIZE)+x, owner);
      }
      // OWNER is the one requesting the update - then sync their assets for them
      else if (owner && (owner == account)) {
        updateAssets(owner);
      }
    } catch (error) {
      // x,y token not minted yet, which is ok
      if (String(error).includes("nonexistent token")) {
        if (x == MAX_SIZE-1) {
          setRows({type: 'increment'})
        }
      } else { // retry on other errors, such as "failed to fetch"
        await sleep(5);
        checkOwner(x,y);
      }
    }
  }

  useEffect(() => {
    loadCachedBoard();

    return () => {
    }
  }, []);

  var xyOptions = [];
  for (let i = 0; i < MAX_SIZE; i++) {
    xyOptions.push(<option key={i} value={i}>{i}</option>);
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (selectZoom == 1) {
      router.push(metaverse ? metaverse : "/")
    }
    else {
      router.push((metaverse ? metaverse+"/" : "")+selectZoom+"/"+selectX+"/"+selectY)
    }
  }

  return (
    <div className="space-y-6">
      {loadingBoard && (
        <div className="flex flex-row justify-center items-center animate-pulse space-x-2 mx-auto">
          <p className="text-purple-600 font-semibold text-lg">Fetching The X,Y Project Grid</p>
          <div className="rounded-full bg-purple-600 h-4 w-4"></div>
          <div className="rounded-full bg-pink-700 h-4 w-4"></div>
          <div className="rounded-full bg-red-500 h-4 w-4"></div>
        </div>
      )}
      {!loadingBoard && rows.count != MAX_SIZE && (
        <div className="text-center space-y-6">
          <p className="text-red-600">
            Updating X,Y Coordinates...{rows.count*100/MAX_SIZE}{"%"}<br />
            (Page may be slow while loading on-chain data. Hang tight!)
          </p>
        </div>
      )}
      {!loadingBoard && rows.count == MAX_SIZE && (
        <div className="text-center space-y-6">
          <XYTotalSupply handleReload={handleReload} />
        </div>
      )}
      <div className="flex flex-row space-x-6 items-end justify-center">
        <div className="flex flex-row space-x-2 items-center">
          <label htmlFor="zoom" className="block text-sm font-medium">Zoom</label>
          <select value={selectZoom} onChange={e => setSelectZoom(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-bg-black border-gray-300 sm:text-sm rounded-md">
            <option value="1">1x</option>
            <option value="2">2x</option>
            <option value="4">4x</option>
            <option value="8">8x</option>
            <option value="16">16x</option>
          </select>
        </div>
        <div className="flex flex-row space-x-2 items-center">
          <label htmlFor="x" className="block text-sm font-medium">X</label>
          <select value={selectX} onChange={e => setSelectX(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-bg-black border-gray-300 sm:text-sm rounded-md">
            {xyOptions}
          </select>
        </div>
        <div className="flex flex-row space-x-2 items-center">
          <label htmlFor="y" className="block text-sm font-medium">Y</label>
          <select value={selectY} onChange={e => setSelectY(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-bg-black border-gray-300 sm:text-sm rounded-md">
            {xyOptions}
          </select>
        </div>
        <div>
          <button type="submit" onClick={handleSubmit} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-500 hover:bg-blue-600">
            Zoom!
          </button>
        </div>
      </div>
      <div id="squares" className={`${props.zoom ? 'zoom-'+props.zoom+'x' : 'game-board'} w-11/12 m-auto grid gap-0 cursor-pointer`}>
        {!loadingBoard && (
          <Squares squares={squares} updatedAt={squaresUpdatedAt} zoom={props.zoom} x={props.x} y={props.y} contract={props.contract} handleToggle={handleToggle} />
        )}
      </div>
    </div>
  );
}

export default Board;
