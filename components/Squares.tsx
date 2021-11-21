import useXYClaim from "../hooks/useXYClaim";
import { MAX_SIZE } from "../util";
import Square from "../components/Square";
import React from 'react';
import dynamic from "next/dynamic";

const Squares = ({edit, moving, squares, updatedAt, zoom, x, y, contract, handleToggle, handleMove }) => {
  const validZoom = zoom && (x || x == 0) && (y || y == 0);
  const iStart = validZoom ? getIStart(zoom, y) : 0;
  const jStart = validZoom ? getIStart(zoom, x) : 0;
  const iEnd = validZoom ? iStart + MAX_SIZE / zoom : MAX_SIZE-1;
  const jEnd = validZoom ? jStart + MAX_SIZE / zoom : MAX_SIZE-1;

  // load this dynamically due to: https://github.com/wwayne/react-tooltip/issues/675
  const ReactTooltip = dynamic(() => import("react-tooltip"), {
    ssr: false,
  });

  const handleTooltipContent = (dataTip) => {
      //ReactTooltip.rebuild();
      if (!dataTip) {
        return "";
      }
      const [coordinates, img_uri, description] = dataTip.split("|");

      return coordinates ? (
        <div className="text-center space-y-1">
          <p>{coordinates}</p>
          {img_uri && (
            <img src={img_uri} width="128" alt={coordinates} />
          )}
          <p>{description}</p>
        </div>
      ) : null;
    };

  function renderSquare(edit, moving, x, y, squares, contract, handleToggle, handleMove) {
    return <Square edit={edit} moving={moving} x={x} y={y} square={squares[(y*MAX_SIZE)+x]} contract={contract} handleToggle={handleToggle} handleMove={handleMove} key={`${x}-${y}`} />;
  }

  function getIStart(zoom, center) {
    var grid_size = MAX_SIZE / zoom;
    var i;
    if (center <= grid_size / 2) {
      i = 0
    }
    else if (center >= MAX_SIZE - grid_size /2 - 1) {
      i = MAX_SIZE - grid_size - 1
    }
    else {
      i = center - grid_size / 2
    }
    return i
  }

  var squaresRendered = [];
  for (var i = iStart; i <= iEnd; i++) {
    //console.log("render")
    for (var j = jStart; j <= jEnd; j++) {
      squaresRendered.push(renderSquare(edit, moving, j, i, squares, contract, handleToggle, handleMove));
    }
  }

  return (
    <>
      {squaresRendered}
      <ReactTooltip id='squaretip'
        getContent={handleTooltipContent}
        effect={'float'}
        place={'top'}
        border={false}
        type={'dark'}
      />
    </>
  );
};

// Only re-render this component if the props have actually changed
function propsAreEqual(prevProps, nextProps) {
  let x = (prevProps.zoom === nextProps.zoom &&
           prevProps.x === nextProps.x &&
           prevProps.y === nextProps.y &&
           prevProps.contract === nextProps.contract &&
           prevProps.edit === nextProps.edit &&
           prevProps.moving === nextProps.moving &&
           // we can't compare the squares array because both prev and next reference the same data
           prevProps.updatedAt === nextProps.updatedAt)
  console.log("check propsAreEqual: " + x)
  return x;
}

export default React.memo(Squares, propsAreEqual);
