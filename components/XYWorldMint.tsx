import { useWeb3React } from "@web3-react/core";
import useXYTotalSupply from "../hooks/useXYTotalSupply";
import ETHBalance from "./ETHBalance";
import Account from "./Account";
import { XYContractAddress, XYWorldContractAddress, MAX_SIZE } from "../util";
import Link from "next/link";
import useXYWorldMint from "../hooks/useXYWorldMint";
import useXYWorldBatchMint from "../hooks/useXYWorldBatchMint";
import useXYWorldPresaleMint from "../hooks/useXYWorldPresaleMint";
import useXYWorldBatchPresaleMint from "../hooks/useXYWorldBatchPresaleMint";
import Multiselect from 'multiselect-react-dropdown';
import React, { useState, useEffect } from 'react';
import * as rax from 'retry-axios';
import axios from "axios";
import Web3 from 'web3';
import { CheckIcon } from '@heroicons/react/outline'

const XYWorldMint = ({ contract, handleReload }) => {
  const { account, library } = useWeb3React();
  const isConnected = typeof account === "string" && !!library;

  const mint = useXYWorldPresaleMint(); // useXYWorldMint();
  const batchMint = useXYWorldBatchPresaleMint(); // useXYWorldBatchMint();

  const LIMITED_EDITION_PRICE = 0.05;

  const handleMint = async () => {
    var tokenIds = [];
    var level = 1; // only limited editions in this phase

    try {
      var selectedItems = multiSelectRef.current.getSelectedItems();
      if (selectedItems && selectedItems.length > 0) {
        selectedItems.map((option) => {
          tokenIds.push(parseInt(option.id));
        })

        const web3 = new Web3();
        const price = (LIMITED_EDITION_PRICE * tokenIds.length).toFixed(2);
        const wei_price = web3.utils.toWei(price.toString(), "ether");

        const proof = await fetchProof();

        if (proof && proof.length > 0 && tokenIds.length == 1) {
          await mint(tokenIds[0], level, proof, wei_price);
        } else if (proof && proof.length > 0 && tokenIds.length > 1) {
          await batchMint(tokenIds, level, proof, wei_price);
        } else if (!proof || proof.length == 0) {
          alert("Could not find your address on the allowlist. Please try another wallet or come back during the public sale. Thank you!");
        }
      }
    } catch (error) {
      // Do nothing
      console.log(error);
    }
  }

  var multiSelectRef = React.createRef();
  let multiSelectOptions = {
      options: [
        //{name: '(0,0)', id: 1},
      ]
  };

  const getAssetsURL = '/api/getAssets';

  const fetchAssets = async (contract) => {
    var assets = []
    if (isConnected && account) {
      const interceptorId = rax.attach(); // retry logic for axios
      await axios({
        method: 'GET',
        url: getAssetsURL,
        params: { owner: account,
                  contract: contract},
        raxConfig: {
          retry: 2
        }
      }).then((response) => {
        // @ts-ignore
        if (response.data.assets) {
          assets = response.data.assets;
        }
      }).catch(error => {
        console.log(error);
      })
    }

    return assets;
  }

  const getProofURL = '/api/mint/getProof';

  const fetchProof = async () => {
    var proof = [];
    if (isConnected && account) {
      const interceptorId = rax.attach(); // retry logic for axios
      await axios({
        method: 'GET',
        url: getProofURL,
        params: { address: account },
        raxConfig: {
          retry: 2
        }
      }).then((response) => {
        // @ts-ignore
        if (response.data.proof) {
          proof = response.data.proof;
        }
      }).catch(error => {
        console.log(error);
      })
    }

    return proof;
  }

  const populateMultiSelect = async () => {
    if (isConnected && account) {
      const xyAssets = await fetchAssets(XYContractAddress);
      const xyWorldAssets = await fetchAssets(XYWorldContractAddress);

      xyAssets.map((asset) => {
        if (asset.token_id) {
          const found = xyWorldAssets.find(world => world.token_id == asset.token_id);
          if (!found) {
            multiSelectOptions.options.push({name: '(' + ((asset.token_id - 1) % 128) + ',' + Math.floor((asset.token_id - 1) / 128) + ')', id: asset.token_id});
          }
        }
      })
    }
  }

  useEffect(() => {
    if (isConnected) {
      populateMultiSelect();
    }
    return () => {
    }
  }, [isConnected]);

  const features = [
    {
      name: '2,500 Limited Edition',
      description: 'A maximum of 2,500 Limited Edition X,Y World NFTs are available',
    },
    { name: 'Sept. 10th 16:00 UTC', description: 'Allowlist-only until Sept. 10th 16:00 UTC' },
    { name: 'Price: 0.05 ETH', description: 'Limited Edition Price is 0.05 ETH. Free Base Editions will be available a few days after the Public Sale starts.' },
    {
      name: 'X,Y Project Owners',
      description: 'Only <a href="https://opensea.io/collection/xy-coordinates">X,Y Project</a> owners can mint. Your wallet X,Y Coordinates will show up below.',
    },
  ]

  return (
    <div className="items-center text-center pt-3">

      <div className="text-left">
        <div className="mx-auto max-w-6xl py-4 px-4 sm:px-6 lg:py-8 lg:px-8">
          <dl className="space-y-10 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:gap-y-12 sm:space-y-0 lg:grid-cols-4 lg:gap-x-8">
            {features.map((feature) => (
              <div key={feature.name} className="relative">
                <dt>
                  <CheckIcon className="absolute h-6 w-6 text-green-500" aria-hidden="true" />
                  <p className="ml-9 text-lg font-medium leading-6">{feature.name}</p>
                </dt>
                <dd className="mt-2 ml-9 text-base text-gray-400" dangerouslySetInnerHTML={{__html: feature.description}}></dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {isConnected && (
        <div className="text-center">
          <p>Choose up to 10 of your Coordinates to Mint at a time, 20 max (20 remaining):<br/></p>
          <Multiselect
          options={multiSelectOptions.options} // Options to display in the dropdown
          selectedValues={multiSelectOptions.selectedValue} // Preselected value to persist in dropdown
          displayValue="name" // Property name to display in the dropdown options
          selectionLimit={10}
          placeholder="Click to Select X,Y Coordinates"
          className="text-black"
          ref={multiSelectRef}
          />
          <br/><br/>
          <button className="bg-og-green hover:bg-og-green-dark text-white text-x\l font-medium py-2 px-4 rounded" onClick={() => handleMint()}>
            Mint your selected Limited Edition X,Y World Plots!
          </button>
          <ETHBalance />
        </div>
      )}
      {!isConnected && (
        <p>
          Connect your wallet to mint.
        </p>
      )}
      <br/>
      By minting, you agree to the following:
      <ul>
        <li>- X,Y World is an <a href="https://medium.com/@xyproject/associative-nfts-be3f1a69dbdc">Associative NFT</a> that automatically updates as you build on your land in-game.</li>
        <li>- After mint, your X,Y World is linked to your X,Y Coordinate. It goes wherever your Coordinate goes.</li>
        <li>- This means X,Y World NFTs are transferrable, but only if you sell your linked X,Y Coordinate.</li>
      </ul>

      <div className="text-center">
        <div className="mx-auto max-w-6xl py-4 px-4 sm:px-6 lg:py-8 lg:px-8">
          <dl className="space-y-10 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:gap-y-12 sm:space-y-0 lg:grid-cols-4 lg:gap-x-8">

            <div className="relative">
              <img className="mx-auto" src="images/xyw_sample_1.png" />
            </div>

            <div className="relative">
              <img className="mx-auto" src="images/xyw_sample_2.png" />
            </div>

            <div className="relative">
              <img className="mx-auto" src="images/xyw_sample_3.png" />
            </div>

            <div className="relative">
              <img className="mx-auto" src="images/xyw_sample_4.png" />
            </div>

          </dl>
        </div>
      </div>

    </div>
  );
};

export default XYWorldMint;
