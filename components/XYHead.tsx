import Link from "next/link";

const XYHead = (props) => {
  return (
    <>
      {props.metaverseName && (
        <>
          <h1 className="text-2xl font-bold">
            <a href={props.metaverseLink} target="_blank" rel="noreferrer">{props.metaverseName}</a> Metaverse Map
          </h1>
        </>
      )}

      {props.metaverseName && (
        <>
        <section className="text-center">
          <p>A map of the <b>{props.metaverseName} Metaverse</b>, built by the {props.metaverseName} community!</p>
        </section>
        <section className="text-left">
          <ul>
            <li>&#183; <b>{props.metaverseName} owners</b>: place your NFTs on any X,Y Coordinate with no {props.metaverseName}</li>
            <li>&#183; <b>X,Y Project owners</b>: rights to use your own Coordinates & kick off others</li>
          </ul>
        </section>
        </>
      )}
      {!props.metaverseName && (
        <>
        <section className="text-center">
        <p><b>X,Y Project</b> is a set of on-chain NFT Plots (X,Y Coordinates) representing a 128x128 GRID.</p>
        </section>
        <h4 className="font-medium">
          Choose a Metaverse:&nbsp;&nbsp;
          <Link href="/">X,Y Project</Link>&nbsp;&nbsp;&#183;&nbsp;&nbsp;
          <Link href="/NFTWorlds">NFT Worlds</Link>&nbsp;&nbsp;&#183;&nbsp;&nbsp;
          <Link href="/Pixelmon">Pixelmon</Link>&nbsp;&nbsp;&#183;&nbsp;&nbsp;
          <Link href="/Metroverse">Metroverse</Link>&nbsp;&nbsp;&#183;&nbsp;&nbsp;
          <Link href="/KaijuKingz">Kaiju Kingz</Link>&nbsp;&nbsp;&#183;&nbsp;&nbsp;
          more soon...
        </h4>
        </>
      )}
    </>
  );
}

export default XYHead;
