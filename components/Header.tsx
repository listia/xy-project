import Link from "next/link";
import Image from "next/image";
import Account from "../components/Account";
import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import useENSName from "../hooks/useENSName";
import { useWeb3React } from "@web3-react/core";
import useXYBalance from "../hooks/useXYBalance";
import { parseBalance, XYContractAddress } from "../util";

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

const Header = (props) => {
  const { account } = useWeb3React();

  const ENSName = useENSName(account);
  const { data } = useXYBalance(account, XYContractAddress);

  return (
    <header className="h-10 px-4 mt-1 flex flex-row items-center space-x-6">
      <h1 className="font-bold text-2xl">
        <Link href="/">
          <a className="text-text-white">
            X,Y Project
          </a>
        </Link>
      </h1>

      <div className="flex flex-row h-6 space-x-4">
        <Link href="https://opensea.io/collection/xy-coordinates?ref=0xe3Ca71F5D505937959893CdEFd2704f062E14833">
          <a className="flex flex-row" target="_blank" rel="noreferrer">
            <svg className="fill-current text-white h-6 w-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 90" xmlSpace="preserve"><path d="M45 0C20.2 0 0 20.2 0 45s20.2 45 45 45 45-20.2 45-45S69.9 0 45 0zM22.2 46.5l.2-.3 11.7-18.3c.2-.3.6-.2.7.1 2 4.4 3.6 9.8 2.9 13.2-.3 1.4-1.3 3.3-2.3 5-.1.3-.3.5-.4.7-.1.1-.2.2-.3.2h-12c-.5 0-.7-.3-.5-.6zm52.2 6.3c0 .2-.1.3-.2.4-.9.4-4 1.8-5.3 3.6-3.3 4.6-5.8 11.1-11.4 11.1H33.9c-8.3 0-15-6.8-15-15.1v-.3c0-.2.2-.4.4-.4h13.1c.3 0 .5.2.4.5-.1.8.1 1.7.5 2.5.8 1.6 2.4 2.6 4.1 2.6h6.5v-5h-6.4c-.3 0-.5-.4-.3-.6.1-.1.1-.2.2-.3.6-.9 1.5-2.2 2.3-3.7.6-1 1.2-2.1 1.6-3.2.1-.2.2-.4.2-.6.1-.4.3-.7.3-1 .1-.3.2-.6.2-.8.2-.9.3-1.9.3-3 0-.4 0-.8-.1-1.2 0-.4-.1-.9-.1-1.3s-.1-.8-.2-1.2c-.1-.6-.2-1.2-.4-1.8l-.1-.2-.3-1.2c-.4-1.3-.8-2.5-1.2-3.6-.2-.5-.3-.9-.5-1.3-.3-.7-.5-1.3-.8-1.8-.1-.3-.2-.5-.4-.7-.1-.3-.3-.5-.4-.8l-.3-.6-.5-1.7c-.1-.2.1-.4.3-.4l5 1.3.6.2.7.2.3.1v-2.9c0-1.4 1.1-2.6 2.5-2.6.7 0 1.3.3 1.8.8s.7 1.1.7 1.8V25l.5.1s.1 0 .1.1c.1.1.3.2.5.4.2.1.4.3.6.5.5.4 1.1.9 1.7 1.4.2.1.3.3.5.4.8.7 1.7 1.6 2.6 2.6.2.3.5.5.7.8.2.3.5.6.7.9l.9 1.2c.1.2.3.4.4.6.4.5.7 1.1 1 1.6.1.3.3.5.4.8.3.7.6 1.5.8 2.2.1.2.1.3.1.5.1.2.1.5.1.7.1.8 0 1.5-.1 2.3-.1.3-.2.6-.3 1-.1.3-.2.6-.4 1-.3.6-.6 1.3-1 1.9-.1.2-.3.5-.4.7-.2.2-.3.5-.5.7-.2.3-.4.6-.6.8-.2.3-.4.5-.6.8-.3.4-.6.7-.9 1l-.6.6-.6.6c-.3.3-.6.5-.8.8l-.5.5c-.1.1-.2.1-.3.1H49v5h5c1.1 0 2.2-.4 3-1.1.3-.3 1.6-1.4 3.1-3 .1-.1.1-.1.2-.1l13.7-4c.3-.1.5.1.5.4v3h-.1z"/></svg>
          </a>
        </Link>

        <Link href="https://twitter.com/XYCoordinates">
          <a className="flex flex-row" target="_blank" rel="noreferrer">
            <svg className="fill-current text-white h-6 w-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 248 248" xmlSpace="preserve"><path d="M221.9 73.3c.1 2.2.1 4.3.1 6.5 0 66.7-50.8 143.7-143.7 143.7-27.4 0-54.3-7.8-77.4-22.6 4 .5 8 .7 12 .7 22.7 0 44.8-7.6 62.7-21.7-21.6-.4-40.6-14.5-47.2-35.1 7.6 1.5 15.4 1.2 22.8-.9-23.6-4.8-40.5-25.5-40.5-49.5v-.6c7 3.9 14.9 6.1 22.9 6.3C11.4 85.3 4.6 55.8 18 32.7c25.6 31.5 63.5 50.7 104.1 52.8-4.1-17.5 1.5-35.9 14.6-48.3 20.3-19.1 52.3-18.1 71.4 2.2 11.3-2.2 22.1-6.4 32.1-12.3-3.8 11.7-11.7 21.6-22.2 27.9 10-1.2 19.8-3.9 29-8-6.6 10.3-15.2 19.1-25.1 26.3z"/></svg>
          </a>
        </Link>

        <Link href="https://discord.com/invite/zBWEsfufPZ">
          <a className="flex flex-row" target="_blank" rel="noreferrer">
            <svg className="fill-current text-white h-6 w-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 127.1 127.1" xmlSpace="preserve"><path d="M107.7 23.5c-8.4-3.8-17.2-6.5-26.2-8.1-1.2 2.2-2.4 4.5-3.4 6.8-9.6-1.5-19.5-1.5-29.1 0-1-2.3-2.1-4.6-3.4-6.8-9.1 1.5-17.9 4.3-26.2 8.1C2.8 48-1.7 72 .5 95.6c9.7 7.2 20.6 12.6 32.2 16.2 2.6-3.5 4.9-7.2 6.9-11.1-3.8-1.4-7.4-3.1-10.9-5.2.9-.7 1.8-1.3 2.7-2 20.4 9.6 44 9.6 64.3 0 .9.7 1.8 1.4 2.7 2-3.5 2-7.1 3.8-10.9 5.2 2 3.9 4.3 7.6 6.9 11.1 11.6-3.5 22.5-9 32.2-16.1 2.6-27.5-4.5-51.2-18.9-72.2zM42.5 81.1c-6.3 0-11.5-5.7-11.5-12.7s5-12.7 11.4-12.7S54 61.4 53.9 68.4s-5.1 12.7-11.4 12.7zm42.2 0c-6.3 0-11.4-5.7-11.4-12.7s5-12.7 11.4-12.7 11.5 5.7 11.4 12.7-5 12.7-11.4 12.7z"/></svg>
          </a>
        </Link>

        <Link href="https://etherscan.io/address/0x3ca53be299c765cdc66cc1723f8b3eefb3aaa413">
          <a className="flex flex-row" target="_blank" rel="noreferrer">
            <svg className="fill-current text-white h-6 w-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 293.8 293.7" xmlSpace="preserve"><path d="M61.022 139.87c0-6.9 5.6-12.5 12.4-12.5h.1l20.7.1c6.9 0 12.5 5.6 12.5 12.5v78.4c2.3-.7 5.3-1.4 8.6-2.2 4.7-1.1 8-5.3 8-10.1v-97.3c0-6.9 5.6-12.5 12.5-12.5h20.8c6.9 0 12.5 5.6 12.5 12.5v90.3s5.2-2.1 10.3-4.2c3.8-1.6 6.3-5.4 6.4-9.6V77.57c0-6.9 5.6-12.5 12.5-12.5h20.8c6.9 0 12.5 5.6 12.5 12.5v88.6c18-13.1 36.3-28.8 50.8-47.6 4.3-5.6 5.5-12.9 3.2-19.5-20.1-58.5-74.8-98.2-136.6-99-81.4-1.1-148.7 65.4-148.7 146.8-.1 25.8 6.6 51.1 19.5 73.5 3.6 6.2 10.5 9.8 17.7 9.2 3.9-.3 8.8-.8 14.6-1.5 5.2-.6 9.2-5 9.2-10.3l-.3-77.9M60.622 265.57c65.6 47.7 157.4 33.2 205.1-32.4 18.3-25.1 28.1-55.3 28.1-86.4 0-3.4-.2-6.7-.4-10-53.7 80-152.7 117.4-232.8 128.8"/></svg>
          </a>
        </Link>
      </div>
      <nav className="flex-grow">
        <div className="flex justify-end">
          {props.isConnected ? (
            <Menu as="div" className="relative inline-block text-left">
              <Menu.Button>
                <span className="sr-only">Open options</span>
                <Image
                  src="/icons/metamask.svg"
                  height={28}
                  width={28}
                  quality={100}
                  className=""
                  alt="menu"
                />
              </Menu.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="origin-top-right absolute right-0 mt-2 w-96 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-200 focus:outline-none text-bg-black">
                  <div className="px-4 py-3">
                    <p className="text-sm">
                      {ENSName || account}
                    </p>
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-sm">
                      XYC:&nbsp;
                      {data ? (
                        parseBalance(data ?? 0, 0, 0)
                      ) : (
                        "Loading..."
                      )}
                    </p>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          ) : (
            <Account triedToEagerConnect={props.triedToEagerConnect} />
          )}
        </div>
      </nav>
    </header>
  );
}

export default Header;
