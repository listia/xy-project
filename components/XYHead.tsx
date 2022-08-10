import Link from "next/link";
import XYProjects from "./XYProjects";

const XYHead = (props) => {
  return (
    <>
      {props.metaverseName && (
        <>
          <h1 className="text-2xl font-bold">
            {props.metaverseName && props.metaverse == 'XYWorld' && (
              <>
                Play X,Y World &#183; View the Live Map (<a href="https://mt-map.xyworld.io/#!/map/0/9/930/1049">fullscreen</a>)
              </>
            )}
            {props.metaverseName && props.metaverse != 'XYWorld' && (
              <>
              <a href={props.metaverseLink} target="_blank" rel="noreferrer">{props.metaverseName}</a> Metaverse Map
              </>
            )}
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
        <section className="text-left">
          <ul>
            <li>&#183; <b>X,Y Project owners</b> can build on their land. <Link href="/login" passHref>Connect your wallet</Link></li>
            <li>&#183; <b>Want to own a plot?</b> <a href="https://opensea.io/collection/xy-coordinates?ref=0xe3Ca71F5D505937959893CdEFd2704f062E14833" target="_blank" rel="noreferrer">Find X,Y Coordinates to buy on OpenSea</a></li>
          </ul>
        </section>
        <section className="text-center">
          <p><b>Free-To-Play</b>: Connect to <b className="text-green-400">mt.xyworld.io:30000</b> from a compatible <a href="https://www.minetest.net/downloads/" target="_blank" rel="noreferrer">Minetest</a> or <a href="https://multicraft.world" target="_blank" rel="noreferrer">Multicraft</a> client</p>
          <p>Available on PC, Linux, Mac, Android & iOS devices</p>
          <p>(click here for the legacy <a href="https://map.xyworld.io">Minecraft map</a>)</p>
        </section>
        </>
      )}
      {!props.metaverseName && (
        <>
        <section className="text-center">
          <p className="text-5xl font-bold">Open-Source Web3 Gaming Platform</p>
          <p className="text-xl pt-3">create your own metaverse game - integrate digital assets and avatars</p>
          <XYProjects/>
        </section>
        </>
      )}
    </>
  );
}

export default XYHead;
