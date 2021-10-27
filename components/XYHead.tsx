import Link from "next/link";

const XYHead = (props) => {
  return (
    <>
      {props.metaverseName && (
        <>
          <h1 className="text-2xl font-bold">
            <a href={props.metaverseLink} target="_blank" rel="noreferrer">{props.metaverseName}</a> Metaverse @ X,Y Project
          </h1>
        </>
      )}

      <section className="text-center">
        <p>The X,Y Project is a full set of X,Y Coordinates stored on chain, representing a 128x128 grid.</p>
        <p>Use X,Y Project in any way you want. For example: maps, tiles, locations, games, virtual worlds, and more.</p>
      </section>

      <h4 className="font-medium">
        Choose a Metaverse:&nbsp;&nbsp;
        <Link href="/">X,Y Project</Link>&nbsp;&nbsp;&#183;&nbsp;&nbsp;
        <Link href="/NFTWorlds">NFT Worlds</Link>&nbsp;&nbsp;&#183;&nbsp;&nbsp;
        more coming soon...
      </h4>

    </>
  );
}

export default XYHead;
