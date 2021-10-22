import Board from "../components/Board";

const Game = (props) => {
  return (
    <div className="w-full">
      <Board contract={props.contract} metaverse={props.metaverse} zoom={props.zoom} x={props.x} y={props.y}/>
    </div>
  );
}

export default Game;
