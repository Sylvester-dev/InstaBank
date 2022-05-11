import React from "react";
import { useQuery } from "../../node_modules/@apollo/client/react/hooks/useQuery";
import findLiqudatablePositions from "../utils/findLiquidatablePositions";
import { useConnection } from "../utils/connection_provider/connection_provider";
import { displayAddress, getImageFromSymbol, query } from "../utils/helpers";
import "../styles/liquidation.scss";
import { toWei } from "../utils/helpers";
import Loading from "../components/loading/Loading";

const Liquidation = () => {
  const {
    protocolDataProvider,
    lendingPoolContract,
    provider,
    walletBalanceProvider,
  } = useConnection();

  const [loans, setLoans] = React.useState([]);
  const [recieveAToken, setrecieveAToken] = React.useState(true);

  const { data, loading, error } = useQuery(query);

  const liquidate = async (index) => {
    console.log(lendingPoolContract);

    const asset = loans[index];

    const result = await lendingPoolContract.liquidationCall(
      asset.collateralAddress,
      asset.borrowedAddress,
      asset.userId,
      toWei(asset.maxPayable),
      recieveAToken
    );

    console.log("Liquidated Successfully");
  };

  React.useEffect(() => {
    if (data === undefined) return;
    if (provider === undefined) return;
    if (protocolDataProvider === undefined) return;

    if (walletBalanceProvider === undefined) return;

    const asyncTask = async () => {
      const liqudableLoans = await findLiqudatablePositions(
        data,
        provider,
        walletBalanceProvider,
        protocolDataProvider
      );

      setLoans(liqudableLoans);
    };

    asyncTask();
  }, [data, protocolDataProvider, provider, walletBalanceProvider]);

  if (loading) return <Loading message={"Fetching liquidable positions"} />;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  console.log(loans);

  return (
    <section className="liquidation mt-6">
      <h4 className="title mb-1">Liquidable Positions</h4>
      <hr className="mb-4"></hr>

      {loans.length > 0 ?
        <>
          <div className="labels pt-1 pb-1 mb-2">
            <p>Pay</p>
            <p>Recieve</p>
            <p>User</p>
            <p>Recieve aToken</p>
            <p className="spread"></p>
          </div>

          {loans.map((loan, index) => (
            <div key={"1"} className="liquidation-tile">
              <div className="">
                <img
                  className=""
                  src={getImageFromSymbol(loan.borrowedSymbol)}
                  alt="Asset Image"
                />
                <p>
                  {loan.maxPayable.toFixed(4)} {loan.borrowedSymbol}
                </p>
              </div>
              <div>
                <img
                  src={getImageFromSymbol(loan.collateralSymbol)}
                  alt="Asset Image"
                />
                <p>
                  {loan.maxRecievable.toFixed(4)} {loan.collateralSymbol}
                </p>
              </div>

              <p>{displayAddress(loan.userId)}</p>

              <div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={recieveAToken}
                    onChange={(e) => setrecieveAToken(e.target.checked)}
                  />
                  <span className="slider round"></span>
                </label>
              </div>
              <div className="spread">
                <button onClick={() => liquidate(index)}>Liquidate</button>
              </div>

              {/* <hr /> */}
            </div>
          ))}
        </> : <div className="backdrop content-size">No liquidable positions found</div>}
    </section>
  );
};

export default Liquidation;

// function LiquidationTile() {
//   return <div></div>;
// }
