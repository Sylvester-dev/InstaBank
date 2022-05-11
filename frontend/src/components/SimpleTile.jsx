import React from "react";

const SimpleTile = ({ name, value }) => {
  return (
    <div className="simple-tile mb-4">
      <p>{name}</p>
      <h6>{value}</h6>
    </div>
  );
};

export default SimpleTile;
