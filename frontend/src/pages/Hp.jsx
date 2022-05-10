import React from "react";
import { useNavigate } from "react-router-dom";

import { useAssetProvider } from "../utils/assets_provider/assets_provider";
import { getImageFromSymbol } from "../utils/helpers";

import ListTile from "../components/list_tile/ListTile";

import "./home_page.scss";
//import PayWithRefi from "../components/PayWithRefi";
//import { useConnection } from "../utils/connection_provider/connection_provider";

function Hp() {
  const navigate = useNavigate();

  const { state: assets } = useAssetProvider();

  console.log("Rendered Home page");

  return (
    <div>
      <section className="stats mt-7 mb-4"></section>

      <hr />
      <section className="assets ">
        <div className="asset-labels pt-1 pb-1 ">
          <p className="spread">Assets</p>
          <p>Market Size</p>
          <p>Deposit APY</p>
          <p>Borrow APY</p>
          <p>Utilization</p>
        </div>
        {assets.length === 0 && <div className="backdrop content-size">Loading Protocol Assets ...</div>}
        {assets.map((asset, index) => (
          <div
            key={index}
            onClick={() =>
              navigate(`/assets/${asset.symbol}`, {
                state: { asset },
              })
            }
            style={{ cursor: "pointer" }}
          >
            <ListTile
              symbol={asset.symbol}
              // image={"/images/" + asset.symbol.toLowerCase() + ".svg"}
              image={getImageFromSymbol(asset.symbol)}
              marketSize={asset.availableLiquidityUsd + asset.totalBorrowedUsd}
              depositAPY={asset.depositAPY}
              borrowAPY={asset.borrowAPY}
              totalBorrowed={asset.totalBorrowed}
              utilizationRatio={asset.utilizationRatio}
            />
            <hr />
          </div>
        ))}
      </section>
    </div>
  );
}

export default Hp;
