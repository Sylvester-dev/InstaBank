import React from 'react'
import { createAlchemyWeb3 } from "@alch/alchemy-web3";
import { useWeb3React } from "@web3-react/core";
import DashboardCard from './DashboardCard.js';

let list;
export default function Dashboard() {

    
    const { account } = useWeb3React();
    
    const web3 = createAlchemyWeb3(
        `https://eth-rinkeby.alchemyapi.io/v2/l0aIxDrSkXUhb-oi7etWE6O9qYXexeqi`,
      );
    

      const ownerAddr = account;
      { account && 
        web3.alchemy.getNfts({
          owner: ownerAddr
        }).then((t) => {
          //console.log(t.ownedNfts)
          list = t.ownedNfts
          console.log(list)
          })
          
      }
      
      
  return (
    <>
      <div>
        Dashboard
        <div>
        { list && 
          list.map((i) => {return (
            <DashboardCard p = {list[i]} />
          )})
        }
        </div>
    </div>
    </>
    
  )
}
