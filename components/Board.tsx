import { useRouter } from 'next/router'
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
import dynamic from "next/dynamic";

const Board = (props) => {
  const router = useRouter()
  const [selectZoom, setSelectZoom] = useState(props.zoom ? props.zoom : 1)
  const [selectX, setSelectX] = useState(props.x ? props.x : 0)
  const [selectY, setSelectY] = useState(props.y ? props.y : 0)
  const metaverse = props.metaverse

  // load this dynamically due to: https://github.com/wwayne/react-tooltip/issues/675
  const ReactTooltip = dynamic(() => import("react-tooltip"), {
    ssr: false,
  });
  const claim = useXYClaim( );
  const ownerOf = useXYOwnerOf();

  const { account, library } = useWeb3React();
  const isConnected = typeof account === "string" && !!library;

  const getAssetsURL = '/api/getAssets';
  const getBoardURL = '/api/getBoard';
  const updateCoordinateURL = '/api/updateCoordinate';

  const [squares, setSquares] = useReducer(squaresReducer, null, function getInitialState(filler) {
    const object = Array(MAX_SIZE*MAX_SIZE).fill(filler);
    return object;
  });

  const [rows, setRows] = useReducer(rowsReducer, {count: 0});

  const MAX_ASSETS = 50;
  const [assetCount, setAssetCount] = useState(0);

  const [loadingBoard, setLoadingBoard] = useState(true);

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
    if (isConnected) {
      // visually show that the squre is pending
      setSquares({ type: 'update',
                   index: (y*MAX_SIZE)+x,
                   owner: "..",
                   color: "",
                   image_uri: ""});
    }
  };

  // toggle image on the square
  const handleToggle = async (x, y) => {
    let response = await axios({
      method: 'GET',
      url: getAssetsURL,
      params: { owner: account,
                limit: MAX_ASSETS,
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
                     image_uri: assets[assetCount].image_thumbnail_url});
        updateCachedCoordinate((y*MAX_SIZE)+x,
                               squares[(y*MAX_SIZE)+x].owner,
                               squares[(y*MAX_SIZE)+x].color,
                               squares[(y*MAX_SIZE)+x].image_uri);
      }
    }
  };

  const loadAssets = async (squareIndex, owner) => {
    const interceptorId = rax.attach(); // retry logic for axios
    axios({
      method: 'GET',
      url: getAssetsURL,
      params: { owner: owner,
                limit: MAX_ASSETS,
                contract: props.contract},
      raxConfig: {
        retry: 2
      }
    }).then((response) => {
      if (squares[squareIndex] == null) {
        squares[squareIndex] = {}
      }
      // @ts-ignore
      setSquares({ type: 'update',
                   index: squareIndex,
                   owner: squares[squareIndex].owner,
                   color: squares[squareIndex].color,
                   // @ts-ignore
                   image_uri: props.contract ? response.data.assets[Math.floor(Math.random()*response.data.assets.length)].image_thumbnail_url : response.data.assets[0].image_thumbnail_url});
      updateCachedCoordinate(squareIndex,
                             squares[squareIndex].owner,
                             squares[squareIndex].color,
                             // @ts-ignore
                             squares[squareIndex].image_uri);
    }).catch(error => {
      console.log(error);
    })
  };

  const loadCachedBoard = async () => {
    const interceptorId = rax.attach(); // retry logic for axios
    axios({
      method: 'GET',
      url: getBoardURL,
      params: { contract: props.contract },
      raxConfig: {
        retry: 10
      }
    }).then((response) => {
      // use a temp variable for faster loading
      var squaresLoaded = Array(MAX_SIZE*MAX_SIZE).fill(null);
      // @ts-ignore
      response.data.coordinates.map((coordinate) => {
        // indexes into coordinate array
        // 0: token_id
        // 1: owner
        // 2: color
        // 3: image_uri
        squaresLoaded[coordinate[0]] = {"owner": coordinate[1],
                                        "color": coordinate[2],
                                        "image_uri": coordinate[3]};
      });

      // update squares state
      setLoadingBoard(false);
      setSquares({ type: 'set', newsquares: squaresLoaded});
      setRows({type: 'reset', count: MAX_SIZE})
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

  const updateOwners = async () => {
    if (isConnected) {
      setRows({type: 'reset', count: 0})
      for (let y = 0; y < MAX_SIZE; y++) {
        for (let x = 0; x < MAX_SIZE; x++) {
          checkOwner(x,y);
          await sleep(5);
        }
      }
    }
  }

  const checkOwner = async (x, y) => {
    try {
      const owner = await ownerOf((y*MAX_SIZE) + x + 1);
      if (x == MAX_SIZE-1) {
        setRows({type: 'increment'})
      }
      if (owner && (squares[(y*MAX_SIZE)+x] == null || squares[(y*MAX_SIZE)+x].owner != owner)) {
        if (squares[(y*MAX_SIZE)+x] == null) {
          squares[(y*MAX_SIZE)+x] = {}
        }
        setSquares({ type: 'update',
                     index: (y*MAX_SIZE)+x,
                     owner: owner,
                     color: squares[(y*MAX_SIZE)+x].color,
                     image_uri: squares[(y*MAX_SIZE)+x].image_uri});
        updateCachedCoordinate((y*MAX_SIZE)+x,
                               owner,
                               squares[(y*MAX_SIZE)+x].color,
                               squares[(y*MAX_SIZE)+x].image_uri);
        loadAssets((y*MAX_SIZE)+x, owner);
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

  function renderSquare(x, y) {
    return <Square x={x} y={y} square={squares[(y*MAX_SIZE)+x]} contract={props.contract} handleClaim={handleClaim} handleToggle={handleToggle} key={`sq-${x}-${y}`} showClickPrompt={isConnected && !loadingBoard && rows.count == MAX_SIZE} />;
  }

  function getIStart(zoom, center) {
    var grid_size = MAX_SIZE / zoom;
    var i;
    if (center <= grid_size / 2) {
      i = 0
    }
    else if (center >= MAX_SIZE - grid_size /2 - 1) {
      i = MAX_SIZE - grid_size - 1
    }
    else {
      i = center - grid_size / 2
    }
    return i
  }

  var squaresRendered = [];
  const zoom = props.zoom;
  const x = props.x;
  const y = props.y;
  const validZoom = zoom && (x || x == 0) && (y || y == 0);
  const iStart = validZoom ? getIStart(zoom, y) : 0;
  const jStart = validZoom ? getIStart(zoom, x) : 0;
  const iEnd = validZoom ? iStart + MAX_SIZE / zoom : MAX_SIZE-1;
  const jEnd = validZoom ? jStart + MAX_SIZE / zoom : MAX_SIZE-1;

  for (var i = iStart; i <= iEnd; i++) {
    for (var j = jStart; j <= jEnd; j++) {
      squaresRendered.push(renderSquare(j, i));
    }
  }

  const handleTooltipContent = (dataTip) => {
      //ReactTooltip.rebuild();
      if (!dataTip) {
        return "";
      }
      const [coordinates, img_uri, description] = dataTip.split("|");

      return coordinates ? (
        <div className="text-center space-y-1">
          <p>{coordinates}</p>
          {img_uri && (
            <img src={img_uri} width="128" />
          )}
          <p>{description}</p>
        </div>
      ) : null;
    };

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
      {isConnected && !loadingBoard && rows.count == MAX_SIZE && (
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
      <div className={`game-board w-11/12 m-auto grid gap-0 cursor-pointer ${zoom ? 'zoom-'+zoom+'x' : ''}`}>
        {squaresRendered}
      <ReactTooltip id='squaretip'
        getContent={handleTooltipContent}
        effect={'solid'}
        place={'top'}
        border={false}
        type={'dark'}
      />
      </div>
    </div>
  );
}

export default Board;
