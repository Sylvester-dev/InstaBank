import React from 'react'
import { createAlchemyWeb3 } from "@alch/alchemy-web3";
import { useWeb3React } from "@web3-react/core";
import DashboardCard from './DashboardCard';


export default function Dashboard() {

    let list;
    const { account } = useWeb3React();

    console.log(account)
    const web3 = createAlchemyWeb3(
        `https://eth-rinkeby.alchemyapi.io/v2/`,
      );
    

      const ownerAddr = account;
      web3.alchemy.getNfts({
        owner: ownerAddr
      }).then((t) => {
        console.log(t.ownedNfts)
        list = t.ownedNfts
        })

      
  return (
    <div>
        Dashboard
        <DashboardCard p={list}/>
    </div>
  )
}
