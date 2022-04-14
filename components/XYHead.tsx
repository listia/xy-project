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
