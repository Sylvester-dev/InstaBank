import React, { useState } from "react";
import { toFixed } from "../../utils/helpers";
import Box from "../Box";
import { InputField } from "../InputField";
import SimpleTile from "../SimpleTile";

const RepaySection = ({
  symbol,
  currentBorrowed,
  isApproved,
  repayAsset,
  error,
  onInputChange,
}) => {
  const [input, setInput] = useState("");

  const decimalsToShow = symbol === "ETH" ? 5 : 2;

  return (
    <div className="borrow">
      <h4>Repay</h4>
      <hr className="mb-5" />

      <div className="mb-5">
        <SimpleTile
          name="Currently Borrowed"
          value={toFixed(currentBorrowed, decimalsToShow) + " " + symbol}
        />
      </div>

      <InputField input={input} setInput={setInput} symbol={symbol} onInputChange={onInputChange} />

      {error ? (
        <div className="error-field">
          <p>{error}</p>
        </div>
      ) : (
        <Box height={30} />
      )}
      {isApproved ? (
        <button
          disabled={input === "" || input === undefined}
          onClick={() => {
            setInput("");
            repayAsset(input, isApproved);
          }}
        >
          Repay
        </button>
      ) : (
        <button
          disabled={input === "" || input === undefined}
          onClick={() => repayAsset(input, isApproved)}>
          Approve & Repay
        </button>
      )}

      <Box height={20} />
      <p className="or">OR</p>
      <Box height={10} />
      {isApproved ?
        <div
          className="ul-btn"
          onClick={() => {
            repayAsset(currentBorrowed + 0.1, isApproved);
          }}
        >
          Repay All
        </div> :
        <div
          className="ul-btn"
          onClick={() => {
            repayAsset(currentBorrowed + 0.1, isApproved);
          }}
        >
          Approve & Repay All
        </div>
      }
    </div>
  );
};

export default RepaySection;
