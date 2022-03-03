import { useWeb3React } from "@web3-react/core";
import { MAX_SIZE } from "../util";

const EditMetaverse = ({ toggleEdit, edit }) => {
  const { account, library } = useWeb3React();
  const isConnected = typeof account === "string" && !!library;

  return (
    <p className="inline-flex items-center">
    {isConnected && (
      <>
        {!edit && (
          <>
            <button type="submit" onClick={toggleEdit} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-500 hover:bg-green-600">
              Click to Place your NFTs
            </button>
            &nbsp;(tip: zoom in first)
          </>
        )}
        {edit && (
          <>
            <button type="submit" onClick={toggleEdit} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-500 hover:bg-gray-600">
              Click to Finish Placing
            </button>
          </>
        )}
      </>
    )}
    {!isConnected && (
      <>
        Connect your wallet to move your NFTs.
      </>
    )}
    </p>
  );
};

export default EditMetaverse;
