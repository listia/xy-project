import { useRouter } from 'next/router'
import Squares from "../components/Squares";
import StaticSquares from "../components/StaticSquares";
import useXYOwnerOf from "../hooks/useXYOwnerOf";
import { XYContractAddress, MAX_SIZE, getRandomNullOrEmptyTokenIndex, GOT_MAP_TOKEN_IDS } from "../util";
import React, { useState, useReducer, useEffect } from 'react';
import { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import XYTotalSupply from "../components/XYTotalSupply";
import EditMetaverse from "../components/EditMetaverse";
import * as rax from 'retry-axios';
import axios from "axios";

const Board = (props) => {
  const router = useRouter()
  const [selectZoom, setSelectZoom] = useState(props.zoom ? props.zoom : 1)
  const [selectX, setSelectX] = useState(props.x ? props.x : 0)
  const [selectY, setSelectY] = useState(props.y ? props.y : 0)
  const metaverse = props.metaverse

  const ownerOf = useXYOwnerOf();

  let { account } = useWeb3React<Web3Provider>();

  const getAssetsURL = '/api/getAssets';
  const getCachedAssetsURL = '/api/getCachedAssets';
  const getBoardURL = '/api/getBoard';
  const getBoardAssetsURL = '/api/getBoardAssets';
  const updateCoordinateURL = '/api/updateCoordinate';
  const updateAssetsURL = '/api/updateAssets';
  const getOSAssetsByContractURL = '/api/getOSAssetsByContract'
  const updateAssetsAlchemyURL = '/api/updateAssetsAlchemy';

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

  const [moving, setMoving] = useState(-1);

  var cachedAssets = []
  var liveAssets = []

  function squaresReducer(squares, action) {
    switch (action.type) {
      case 'update':
        if (squares[action.index] == null) {
          squares[action.index] = {}
        }
        squares[action.index].owner = action.owner;
        squares[action.index].color = action.color;
        squares[action.index].image_uri = action.image_uri;
        squares[action.index].token_id = action.token_id;
        squares[action.index].token_owner = action.token_owner;
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

    //utility functions for initializing data
    //initOwnedCachedAssetsIfEmpty();
    //placeOwnedTokens();
    //placeAllTokens();
  }

  const toggleEdit = async (e) => {
    e.preventDefault()
    setMoving(-1)
    if (!router.query.edit) {
      if (selectZoom == 1) {
        router.push((metaverse ? metaverse : "/") + "?edit=1")
      }
      else {
        router.push(((metaverse ? metaverse+"/" : "")+selectZoom+"/"+selectX+"/"+selectY) + "?edit=1")
      }
    }
    else {
      handleSubmit(e)
    }
    initConnectedWalletAssets();

    // utility functions when doing maintenance
    //placeOwnedAssets();
    //placeAllTokens();
    //updateAllCachedAssets();
  }

  // moving images in metaverses
  const handleMove = async (x, y) => {
    const index = (y*MAX_SIZE)+x
    if (props.contract) {
      // start moving if not already moving and you own this token
      if (moving == -1 && squares[index].token_owner === account) {
        console.log("Start moving token at: " + x + "," + y)
        setMoving(index)
      }
      // already moving and clicked on a spot you own or a free one
      else if (moving >= 0 && (squares[index].owner === account || !squares[index].token_owner)) {
        console.log("Finishing moving token to: " + x + "," + y)
        // save destination info
        let destination_square = { owner: squares[index].owner,
                                   color: squares[index].color,
                                   image_uri: squares[index].image_uri,
                                   token_id: squares[index].token_id,
                                   token_owner: squares[index].token_owner }
        // move source to destination
        setSquares({ type: 'update',
                     index: index,
                     owner: destination_square.owner,
                     color: destination_square.color,
                     image_uri: squares[moving].image_uri,
                     token_id: squares[moving].token_id,
                     token_owner: squares[moving].token_owner});
        // swap destination to source
        setSquares({ type: 'update',
                     index: moving,
                     owner: squares[moving].owner,
                     color: squares[moving].color,
                     image_uri: destination_square.image_uri,
                     token_id: destination_square.token_id,
                     token_owner: destination_square.token_owner});
        setSquaresUpdatedAt(Date.now());
        updateCachedCoordinate(index,
                               destination_square.owner,
                               destination_square.color,
                               squares[moving].image_uri,
                               squares[moving].token_id,
                               squares[moving].token_owner);
        updateCachedCoordinate(moving,
                               squares[moving].owner,
                               squares[moving].color,
                               destination_square.image_uri,
                               destination_square.token_id,
                               destination_square.token_owner);
        setMoving(-1)
      }
    }
  }

  // toggle image on the square
  const handleToggle = async (x, y) => {
    if (!props.contract) {
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
                       image_uri: assets[assetCount].image_uri,
                       token_id: assets[assetCount].token_id,
                       token_owner: squares[(y*MAX_SIZE)+x].owner});
          setSquaresUpdatedAt(Date.now());
          updateCachedCoordinate((y*MAX_SIZE)+x,
                                 squares[(y*MAX_SIZE)+x].owner,
                                 squares[(y*MAX_SIZE)+x].color,
                                 squares[(y*MAX_SIZE)+x].image_uri,
                                 squares[(y*MAX_SIZE)+x].token_id,
                                 squares[(y*MAX_SIZE)+x].token_owner);
        }
      }
    }
  };

  const fetchLiveAssets = async (owner) => {
    let assets = []
    let liveOwner = liveAssets.find(x=>x.owner===owner);
    if (!liveOwner) {
      const interceptorId = rax.attach(); // retry logic for axios
      await axios({
        method: 'GET',
        url: getAssetsURL,
        params: { owner: owner,
                  contract: props.contract},
        raxConfig: {
          retry: 2
        }
      }).then((response) => {
        // @ts-ignore
        assets = response.data.assets;
        liveAssets.push({owner: owner, assets:JSON.parse(JSON.stringify(assets))});
      }).catch(error => {
        console.log(error);
      })
    }
    else {
      assets = liveOwner.assets;
    }

    return assets;
  }

  const fetchCachedAssets = async (owner) => {
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
        cachedAssets.push({owner: owner, assets:JSON.parse(JSON.stringify(assets))});
      }).catch(error => {
        console.log(error);
        updateAssets(owner);
      })
    }
    else {
      assets = cachedOwner.assets;
    }

    return assets;
  }

  // places a random asset onto the square
  // will honor the collection if there is one and also can pull from cache or live
  const placeRandomAsset = async (squareIndex, owner, unique, cached) => {
    let assets = []
    if (cached) {
      await fetchCachedAssets(owner)
    } else{
      await fetchLiveAssets(owner)
    }

    if (assets && assets.length > 0) {
      console.log("placeRandomAsset found some assets")
      if (squares[squareIndex] == null) {
        squares[squareIndex] = {}
      }

      let asset_index = -1
      if (unique) { // special metaverses that only allow a token to exist on the map once
        // find a new token_id/image_uri to place in the square
        let i = 0
        while (i < assets.length && asset_index == -1) {
          console.log("placeRandomAsset looking for token_id: " + assets[i].token_id)
          let found = squares.find(x => x.token_id === assets[i].token_id)
          if (!found) {
            console.log("placeRandomAsset not found!")
            asset_index = i;
          }
          i+=1;
        }
      } else {
        asset_index = Math.floor(Math.random()*assets.length)
      }

      if (asset_index >= 0 && asset_index < assets.length) {
        let image_uri = assets[asset_index].image_uri
        let token_id = assets[asset_index].token_id
        let token_owner = owner
        setSquares({ type: 'update',
                     index: squareIndex,
                     owner: squares[squareIndex].owner,
                     color: squares[squareIndex].color,
                     image_uri: image_uri,
                     token_id: token_id,
                     token_owner: token_owner});
        setSquaresUpdatedAt(Date.now());
        updateCachedCoordinate(squareIndex,
                               squares[squareIndex].owner,
                               squares[squareIndex].color,
                               image_uri,
                               token_id,
                               token_owner);
      }
    }
    else if (!props.contract) {
      updateAssets(owner);
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
            // 2: contract_token_id
            // 3: token_owner (of the asset, not the XY coord)
            // @ts-ignore
            let asset = assetsResponse.data.coordinates.find(x => x[0] === coordinate[0])
            squaresLoaded[coordinate[0]] = {"owner": coordinate[1],
                                            "color": coordinate[2],
                                            "image_uri": asset && asset[1] ? asset[1] : null,
                                            "token_id": asset && asset[2] ? asset[2] : null,
                                            "token_owner": asset && asset[3] ? asset[3] : null};
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
                                          "image_uri": coordinate[3],
                                          "token_id": null,
                                          "token_owner": null};
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

  const updateCachedCoordinate = async (tokenId, owner, color, image_uri, contract_token_id, token_owner) => {
    axios({
      method: 'POST',
      url: updateCoordinateURL,
      data: {
        token_id: tokenId,
        owner: owner,
        color: color,
        image_uri: image_uri,
        contract: props.contract,
        contract_token_id: contract_token_id,
        token_owner: token_owner
      },
    }).then((response) => {
      console.log("updateCachedCoordinate result: " + JSON.stringify(response.data, null, 2))
    }).catch(error => {
      console.log(error);
    })
  };

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
                     image_uri: props.contract ? squares[(y*MAX_SIZE)+x].image_uri : "",
                     token_id: props.contract ? squares[(y*MAX_SIZE)+x].token_id : null,
                     token_owner: props.contract ? squares[(y*MAX_SIZE)+x].token_owner : null});
        setSquaresUpdatedAt(Date.now());
        updateCachedCoordinate((y*MAX_SIZE)+x,
                               owner,
                               squares[(y*MAX_SIZE)+x].color,
                               squares[(y*MAX_SIZE)+x].image_uri,
                               squares[(y*MAX_SIZE)+x].token_id,
                               squares[(y*MAX_SIZE)+x].token_owner);
        await updateAssets(owner);
        if (!props.contract) {
          placeRandomAsset((y*MAX_SIZE)+x, owner, false, true);
        }
      }
      // EXISTING owner, but no image set yet
      else if (!props.contract && owner && !squares[(y*MAX_SIZE)+x].image_uri) {
        placeRandomAsset((y*MAX_SIZE)+x, owner, false, true);
      }
      // OWNER is the one requesting the update - then sync their assets for them
      else if (owner && (owner == account)) {
        updateAssets(owner);
      }
    } catch (error) {
      await sleep(5);
      checkOwner(x,y);
    }
  }

  useEffect(() => {
    if (props.metaverse != 'XYWorld') {
      loadCachedBoard();
    } else {
      setLoadingBoard(false);
    }
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

  // add any assets from this connected wallet to the board if needed
  // - populates the board with this user's assets when visiting a metaverse
  // for the first time, if they are part of this metaverse
  const initConnectedWalletAssets = async () => {
    let assets = await fetchCachedAssets(account)

    if (assets && assets.length > 0) {
      console.log("initConnectedWalletAssets found some assets")
      let i = 0
      while (i < assets.length) {
        console.log("initConnectedWalletAssets looking for token_id: " + assets[i].token_id)
        let found = squares.find(x => x.token_id === assets[i].token_id)
        if (!found) {
          console.log("initConnectedWalletAssets not found!")
          // add it to the board randomly
          const squareIndex = getRandomNullOrEmptyTokenIndex(squares);

          if (squares[squareIndex] == null) {
            squares[squareIndex] = {}
          }

          console.log("initConnectedWalletAssets random index:" + squareIndex)
          let image_uri = assets[i].image_uri
          let token_id = assets[i].token_id
          let token_owner = account
          setSquares({ type: 'update',
                       index: squareIndex,
                       owner: squares[squareIndex].owner,
                       color: squares[squareIndex].color,
                       image_uri: image_uri,
                       token_id: token_id,
                       token_owner: token_owner});
          setSquaresUpdatedAt(Date.now());
          updateCachedCoordinate(squareIndex,
                                 squares[squareIndex].owner,
                                 squares[squareIndex].color,
                                 image_uri,
                                 token_id,
                                 token_owner);
        }
        i+=1;
      }
    }
  }

  ////////////////////////////////////////////////////////////////////
  /// UTILITY functions used to initialize data or perform maintenance

  // run through all spots and update their cached assets in the DB,
  // even if they already have a cached assets entry
  const updateAllCachedAssets = async () => {
    let owners = []
    setRows({type: 'reset', count: 0})
    for (let y = 0; y < MAX_SIZE; y++) {
      for (let x = 0; x < MAX_SIZE; x++) {
        let square = squares[(y*MAX_SIZE)+x];
        if (square && square.owner) {
          let foundOwner = owners.find(x=>x===square.owner);
          if (!foundOwner) {
            owners.push(square.owner);
            await updateAssets(square.owner);
          }
          if (x == MAX_SIZE-1) {
            setRows({type: 'increment'})
          }
        }
      }
    }
  }
  
  // fill the board with metavers-specific assets that are owned by XY owners
  // useful for setting up the map for new collections we support
  const placeOwnedAssets = async () => {
    setRows({type: 'reset', count: 0})
    for (let y = 0; y < MAX_SIZE; y++) {
      for (let x = 0; x < MAX_SIZE; x++) {
        let square = squares[(y*MAX_SIZE)+x];
        if (square && square.owner && !square.image_uri) {
          await placeRandomAsset((y*MAX_SIZE)+x, square.owner, true, false);
        }
        if (x == MAX_SIZE-1) {
          setRows({type: 'increment'})
        }
        await sleep(5);
      }
    }
  }

  // Only add cached assets to the DB for XY coordinate owners
  // that don't have a cached assets entry yet
  const initOwnedCachedAssetsIfEmpty = async () => {
    for (let y = 0; y < MAX_SIZE; y++) {
      for (let x = 0; x < MAX_SIZE; x++) {
        let square = squares[(y*MAX_SIZE)+x];
        let assets = []
        let cachedOwner = cachedAssets.find(x=>x.owner===square.owner);
        if (!cachedOwner) {
          const interceptorId = rax.attach(); // retry logic for axios
          await axios({
            method: 'GET',
            url: getCachedAssetsURL,
            params: { owner: square.owner },
            raxConfig: {
              retry: 2
            }
          }).then((response) => {
            // @ts-ignore
            assets = response.data.assets;
            cachedAssets.push({owner: square.owner, assets:JSON.parse(JSON.stringify(assets))});
          }).catch(error => {
            console.log(error);
          })
        }
        else {
          assets = cachedOwner.assets;
        }
        if (!assets || assets.length === 0) {
          await updateAssets(square.owner);
          sleep(100)
        }
      }
    }
  }

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1)); // random index from 0 to i
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  const placeOwnedTokens = async () => {
    for (let i = 0; i < GOT_MAP_TOKEN_IDS.length; i++) {
      const square = squares[GOT_MAP_TOKEN_IDS[i]-1]
      if (square && square.owner && !square.image_uri) {
        await placeRandomAsset(GOT_MAP_TOKEN_IDS[i]-1, square.owner, true, false);
      }
    }
  }

  // Make sure the board is filled with all the possible tokens
  // in the shape of the GOT_MAP_TOKEN_IDS map
  // Also delete any duplicates if found
  const placeAllTokens = async () => {
    shuffle(GOT_MAP_TOKEN_IDS)
    const MAX_ASSETS = 50;
    let flag = true;
    let offset = 0;
    let spot_index = 0;
    while (flag) {
      let response = await axios({
        method: 'GET',
        url: getOSAssetsByContractURL,
        params: { contract: props.contract,
                  offset: offset,
                  max_assets: MAX_ASSETS }
      });
      // @ts-ignore
      let assets = response.data.assets;
      if (!assets || assets.length === 0) {
          flag = false;
      }
      else if (assets) {
        for (let i = 0; i < assets.length; i++) {
          console.log("Looking to place asset: " + i);
          let image_uri = assets[i].image_uri
          let token_id = assets[i].token_id
          let token_owner = assets[i].owner

          console.log("Looking for existing square with token_id: " + token_id);
          let found = squares.filter(x => x.token_id === token_id)
          console.log("Value of found: " + JSON.stringify(found, null, 2));
          if (!found || found.length === 0) {
            let squareIndex = GOT_MAP_TOKEN_IDS[spot_index] - 1
            spot_index += 1;
            while (squares[squareIndex] && squares[squareIndex].token_id) {
              squareIndex = GOT_MAP_TOKEN_IDS[spot_index] - 1
              spot_index += 1;
            }

            console.log("Found empty square index: " + squareIndex);
            if (squares[squareIndex] == null) {
              squares[squareIndex] = {}
            }
            setSquares({ type: 'update',
                         index: squareIndex,
                         owner: squares[squareIndex].owner,
                         color: squares[squareIndex].color,
                         image_uri: image_uri,
                         token_id: token_id,
                         token_owner: token_owner});
            setSquaresUpdatedAt(Date.now());
            updateCachedCoordinate(squareIndex,
                                   squares[squareIndex].owner,
                                   squares[squareIndex].color,
                                   image_uri,
                                   token_id,
                                   token_owner);
          }
          else {
            // Make sure there are no duplicates on the board - delete them if found
            while (found.length > 1) {
              console.log("Deleting duplicates. Value of found: " + JSON.stringify(found, null, 2));
              let squareIndex = squares.findIndex(x => x.token_id === token_id)
              setSquares({ type: 'update',
                           index: squareIndex,
                           owner: squares[squareIndex].owner,
                           color: squares[squareIndex].color,
                           image_uri: null,
                           token_id: null,
                           token_owner: null});
              setSquaresUpdatedAt(Date.now());
              updateCachedCoordinate(squareIndex,
                                     squares[squareIndex].owner,
                                     squares[squareIndex].color,
                                     null,
                                     null,
                                     null);
              found = squares.filter(x => x.token_id === token_id)
            }
          }
        }

        offset += assets.length
      }
    }
  }
  /// End of UTILITY functions
  ////////////////////////////////////////////////////////////////////

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
      {!props.contract && !loadingBoard && rows.count == MAX_SIZE && props.metaverse != 'XYWorld' && (
        <div className="text-center">
          Check out our amazing X,Y Community on the GRID!<br/>
          <XYTotalSupply contract={props.contract} handleReload={handleReload} />
        </div>
      )}
      {props.contract && !loadingBoard && rows.count == MAX_SIZE && props.metaverse != 'XYWorld' && (
        <div className="text-center space-y-6">
          <EditMetaverse toggleEdit={toggleEdit} edit={router.query.edit} />
        </div>
      )}
      {props.metaverse != 'XYWorld' && (
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
      )}
      {(props.zoom === undefined || props.zoom === 1) && props.metaverse == 'XYWorld' && (
        <div className="flex flex-col h-screen">
          <iframe src="https://mt-map.xyworld.io/#!/map/0/9/930/1049" className="flex flex-grow"></iframe>
        </div>
      )}
      {(props.zoom === undefined || props.zoom === 1) && !props.metaverse && !router.query.live && !router.query.edit && (
        <div id="squares" className={`game-board w-11/12 m-auto gap-0 cursor-pointer`}>
          <StaticSquares squares={squares} contract={props.contract} image="https://assets.nfty.dev/xy/the_grid.png" />
        </div>
      )}
      {((props.zoom !== undefined && props.zoom !== 1) || (props.metaverse && props.metaverse != 'XYWorld') || router.query.live === "1" || router.query.edit === "1") && !loadingBoard && (
        <div id="squares" className={`${props.zoom ? 'zoom-'+props.zoom+'x' : 'game-board'} w-11/12 m-auto grid gap-0 cursor-pointer`}>
          <Squares edit={router.query.edit} moving={moving} squares={squares} updatedAt={squaresUpdatedAt} zoom={props.zoom} x={props.x} y={props.y} contract={props.contract} handleToggle={handleToggle} handleMove={handleMove} />
        </div>
      )}
    </div>
  );
}

export default Board;
