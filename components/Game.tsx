import Board from "../components/Board";

const Game = (props) => {
  return (
      <div className="w-full">
        <Board contract={props.contract} />
      </div>
    );
}

export default Game;
