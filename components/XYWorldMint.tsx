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
import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'



const XYWorldMint = () => {
  const { account, library } = useWeb3React();
  const isConnected = typeof account === "string" && !!library;

  const mint = useXYWorldPresaleMint(); // useXYWorldMint();
  const batchMint = useXYWorldBatchPresaleMint(); // useXYWorldBatchMint();
  const [xyWorldAssetsCount, setxyWorldAssetsCount] = useState(0);
  const [open, setOpen] = useState(false)

  const LIMITED_EDITION_PRICE = 0.05;
  const LIMITED_EDITION_MAX = 20;

  const handleMint = async () => {
    var tokenIds = [];
    var level = 1; // only limited editions in this phase

    try {
      // @ts-ignore
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
          // @ts-ignore
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
          // @ts-ignore
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

      setxyWorldAssetsCount(xyWorldAssets.length)

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
    { name: 'Sept. 9th 16:00 UTC', description: 'Allowlist-only for the first 24 hours. Public Sale starts Sept. 10th 16:00 UTC' },
    { name: 'Price: 0.05 ETH', description: 'Limited Edition Price is 0.05 ETH. Free Base Editions will be available a few days after Public Sale starts.' },
    {
      name: 'X,Y Project Owners',
      description: 'Only <a href="https://opensea.io/collection/xy-coordinates" target="_blank" rel="noreferrer">X,Y Project</a> owners can mint. Your wallet X,Y Coordinates will show up in the box below.',
    },
  ]

  return (
    <>
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
        <>
        {xyWorldAssetsCount < LIMITED_EDITION_MAX && (
          <div className="text-center">
            <p>Choose up to 10 of your Coordinates to Mint at a time, limit 20 for allowlist mint ({LIMITED_EDITION_MAX - xyWorldAssetsCount} remaining):<br/></p>
            <Multiselect
            options={multiSelectOptions.options} // Options to display in the dropdown
            // @ts-ignore
            selectedValues={multiSelectOptions.selectedValue} // Preselected value to persist in dropdown
            displayValue="name" // Property name to display in the dropdown options
            selectionLimit={LIMITED_EDITION_MAX - xyWorldAssetsCount < 10 ? 1 : 10}
            placeholder="Click to Select X,Y Coordinates"
            className="text-black"
            // @ts-ignore
            ref={multiSelectRef}
            />
            <br/><br/>
            <button className="bg-og-green hover:bg-og-green-dark text-white text-xl font-medium py-2 px-4 rounded" onClick={() => handleMint()}>
              Mint your selected Limited Edition X,Y World Plots!
            </button>
            <ETHBalance />
            {xyWorldAssetsCount > 0 && (
              <p>
                Your Minted X,Y World Plots: <b>{xyWorldAssetsCount}</b>
              </p>
            )}
          </div>
        )}
        {xyWorldAssetsCount >= LIMITED_EDITION_MAX && (
          <div className="text-center">
            <p><b>You have minted {LIMITED_EDITION_MAX} X,Y World Associative NFTs which is the maximum for the allowlist mint.</b></p>
          </div>
        )}
        </>
      )}
      {!isConnected && (
        <p>
          Connect your wallet to mint.
        </p>
      )}
      <br/>
      By minting, you agree to the following:
      <ul>
        <li>· X,Y World is an <a href="https://medium.com/@xyproject/associative-nfts-be3f1a69dbdc" target="_blank" rel="noreferrer">Associative NFT</a> that automatically updates as you build on your land in-game.</li>
        <li>· After mint, your X,Y World is linked to your X,Y Coordinate. It goes wherever your Coordinate goes.</li>
        <li>· This means X,Y World NFTs are transferrable, but only if you sell your linked X,Y Coordinate.</li>
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
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={setOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6">
                <div>
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                    <CheckIcon className="h-6 w-6 text-green-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-5">
                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                      Transaction sent
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Be sure to verify your transaction on the blockchain. Allowlist wallets are allowed to mint up to {LIMITED_EDITION_MAX} before the public mint.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-6">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-500 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-600 focus:outline-none sm:text-sm"
                    onClick={() => setOpen(false)}
                  >
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
    </>
  );
};

export default XYWorldMint;
