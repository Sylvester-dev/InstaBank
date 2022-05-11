import React from "react";
import { ethers } from "ethers";
import { useConnection } from "../utils/connection_provider/connection_provider";
import { toEther } from "../utils/helpers";
import Box from "./Box";
import "../styles/pay_with_refi.scss";

const PayWithRefi = ({ address, provider }) => {
  const { refiCollectionContract, accounts } = useConnection();

  const [tokenURI, setTokenURI] = React.useState("");
  const [selectedToken, setSelectedToken] = React.useState("DAI");

  const fetchData = async () => {
    const tokenId = await refiCollectionContract.getTokenId(accounts[0]);

    if (toEther(tokenId) === 0) return;

    let tokenURI = await refiCollectionContract.tokenURI(tokenId);
    // console.log("Token URI", tokenURI)
    tokenURI = tokenURI.split(",")[1];

    const metadata = Buffer.from(tokenURI, "base64").toString("ascii");

    setTokenURI(JSON.parse(metadata).image);
  };

  React.useEffect(() => {
    if (refiCollectionContract === undefined) return;
    // fetchData();
  }, [refiCollectionContract, accounts]);

  const payWithRefi = async () => {};

  return (
    <section className="pay-with-refi">
      {tokenURI === "" ? <div></div> : <img src={tokenURI} alt="Credit card" />}

      <Box height={16} />
      <div className="space-between">
        <h6>Borrow Limit</h6>

        <h4>$ 202</h4>
      </div>
      <Box height={24} />
      <div className="input-box">
        <div className="select-box">
          <select
            value={selectedToken}
            onChange={(e) => setSelectedToken(e.target.value)}
          >
            <option value={"ETH"}>ETH</option>
            <option value={"DAI"}>DAI</option>
            <option value={"LINK"}>LINK</option>
          </select>
        </div>
        <input placeholder="Enter amount to pay" type={"number"} />
      </div>
      <Box height={8} />
      <div className="space-between">
        <div></div>
        <p>Amount - $234</p>
      </div>
      <Box height={16} />
      <button onClick={payWithRefi} className="pay-btn">
        PAY WITH REFI
      </button>
      <Box height={16} />
    </section>
  );
};

export default PayWithRefi;
