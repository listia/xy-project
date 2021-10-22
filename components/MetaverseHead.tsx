import Link from "next/link";

const MetaverseHead = (props) => {
  return (
    <>
      <h1 className="text-3xl font-bold"><a href={props.metaverseLink} target="_blank" rel="noreferrer">{props.metaverseName}</a> Metaverse</h1>

      <h2 className="text-2xl font-bold text-center">
        Claim free <Link href="/">X,Y Coordinates</Link> / Add your NFTs to The Grid
      </h2>
    </>
  );
}

export default MetaverseHead;
