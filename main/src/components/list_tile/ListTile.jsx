import React from "react";
import "./list_tile.scss";

function ListTile({
  symbol,
  image,
  marketSize,
  depositAPY,
  borrowAPY,
  totalBorrowed,
  utilizationRatio
}) {
  return (
    <div className="tile-container pt-2 pb-2 ">
      <div className="spread">
        <img
          className="mr-2"
          src={image}
          alt="Crypto Icon"
        />
        <h4>{symbol}</h4>
      </div>
      <p>$ {marketSize.toFixed(2)}</p>
      <p>{depositAPY.toFixed(2)}%</p>
      <p>{borrowAPY.toFixed(2)}%</p>
      <p>{(utilizationRatio * 100).toFixed(2)}%</p>
    </div>
  );
}

export default ListTile;
