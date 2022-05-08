import React, { useRef, useEffect } from "react";

export const InputField = ({ input, setInput, symbol, onInputChange }) => {
  const inputRef = useRef();

  useEffect(() => {
    var invalidChars = [
      "-",
      "+",
      "e",
    ];

    const cleanField = (e) => {
      if (invalidChars.includes(e.key)) {
        e.preventDefault();
      }
    }

    if (inputRef && inputRef.current) {
      inputRef.current.addEventListener("keydown", cleanField);
      return function cleanup() {
        inputRef.current.removeEventListener("keydown", cleanField);
      };
    }
  }, [])

  return (
    <div>
      <div className="input-field">
        <input
          type="number"
          placeholder="Amount"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            onInputChange()
          }}
          ref={inputRef}
          min={0}
        />
        <h6 className="mb-2">
          {symbol}
        </h6>
      </div>

    </div>
  );
};
