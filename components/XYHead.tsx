import Link from "next/link";
import XYProjects from "./XYProjects";

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

      {props.metaverseName && props.metaverse != 'XYWorld' && (
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
      {props.metaverseName && props.metaverse == 'XYWorld' && (
        <>
        <section className="text-center">
          <p>A map of the <b>{props.metaverseName} Metaverse</b> biomes based on the Minecraft Seed for our NFT Worlds #8985!</p>
        </section>
        <section className="text-left">
          <ul>
            <li>&#183; <b>X,Y Project owners</b> get exclusive rights to build on their land in-game</li>
            <li>&#183; <b>Want to own a plot?</b> Click the map to buy X,Y coordinates on <a href="https://opensea.io/collection/xy-coordinates?ref=0xe3Ca71F5D505937959893CdEFd2704f062E14833" target="_blank" rel="noreferrer">OpenSea</a></li>
            <li>&#183; <b>Note</b>: in-game land may be different if the previous owner has modified it</li>
          </ul>
        </section>
        <section className="text-center">
          <p>To play X,Y World, just connect to <b>play.xyworld.io</b> from Minecraft 1.17+ or visit <a href="https://nftworlds.com/play" target="_blank" rel="noreferrer">NFTWorlds.com/play</a></p>
        </section>
        </>
      )}
      {!props.metaverseName && (
        <>
        <section className="text-center">
          <p className="text-5xl font-bold">A Metaverse Gaming Platform</p>
          <p className="text-xl pt-3">digital collectible land, avatars and in-game assets</p>
          <XYProjects/>
        </section>
        </>
      )}
    </>
  );
}

export default XYHead;
