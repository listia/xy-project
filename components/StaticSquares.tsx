import useXYClaim from "../hooks/useXYClaim";
import { MAX_SIZE, shortenHex } from "../util";
import React, { useEffect, useRef, useState } from 'react';
import dynamic from "next/dynamic";
import Img from 'react-cool-img';

const StaticSquares = ({squares, contract, image }) => {
  // load this dynamically due to: https://github.com/wwayne/react-tooltip/issues/675
  const ReactTooltip = dynamic(() => import("react-tooltip"), {
    ssr: false,
  });
  const imageRef = useRef(null);
  const [toolTips, setToolTips] = useState([]);

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

  function handleClick(token_id) {
    window.open("https://opensea.io/assets/0x3ca53be299c765cdc66cc1723f8b3eefb3aaa413/" + token_id + "?ref=0xe3Ca71F5D505937959893CdEFd2704f062E14833");
  }

  function renderTooltip(x, y, square, width) {
    const xOffset = Math.floor(x * width / MAX_SIZE);
    const yOffset = Math.floor(y * width / MAX_SIZE);
    const squareWidth = Math.floor(width / MAX_SIZE);
    const img = square && square.image_uri && !square.image_uri.includes(".mp4") && !square.image_uri.includes(".mov") && !square.image_uri.includes(".webm") ? square.image_uri : ""
    const description = square && square.owner ? shortenHex(square.owner, 4) : ""
    return <area onClick={() => handleClick((y*MAX_SIZE) + x + 1)} data-for='squaretip' data-tip={`(${x},${y})|${img}|${description}`} shape="rect" coords={`${xOffset},${yOffset},${xOffset+squareWidth},${yOffset+squareWidth}`} key={`${x}-${y}`} />
  }

  const renderTooltips = async () => {
    const width = parseInt(imageRef.current.offsetWidth);
    //console.log("staticSquares width:", width);
    if ( width > 0 && squares.length > 0 ) {
      let tooltipsRendered = []
      for (var i = 0; i < MAX_SIZE; i++) {
        for (var j = 0; j < MAX_SIZE; j++) {
          tooltipsRendered.push(renderTooltip(j, i, squares[(i*MAX_SIZE)+j], width));
        }
      }
      setToolTips([...tooltipsRendered]);
    }
  }

  function debounce(fn, ms) {
    let timer
    return _ => {
      clearTimeout(timer)
      timer = setTimeout(_ => {
        timer = null
        // @ts-ignore
        fn.apply(this, arguments)
      }, ms)
    };
  }

  const debouncedHandleResize = debounce(function handleResize() {
    renderTooltips();
  }, 500)

  useEffect(() => {
    renderTooltips();
    window.addEventListener('resize', debouncedHandleResize)
    
    return () => {
      window.removeEventListener('resize', debouncedHandleResize);
    };
  }, [imageRef.current, squares]);

  return (
    <>
      <img
        className={`cursor-pointer`}
        src={image}
        alt="The GRID"
        useMap="#Map"
        ref={imageRef} />
      <map name="Map">
        {toolTips}
      </map>
      <ReactTooltip id='squaretip'
        getContent={handleTooltipContent}
        effect={'float'}
        border={false}
        type={'dark'}
      />
    </>
  );
};

export default StaticSquares;
