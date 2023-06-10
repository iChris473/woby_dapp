import React, { useEffect, useState } from "react";
import Web3 from "web3";
import "./App.css";
import Header from "./components/Header";
import Staking from "./components/staking";
import NetworkChange from "./networkSwitch";
const web3 = new Web3(
  Web3.givenProvider ? Web3.givenProvider : "https://bsc-dataseed1.binance.org/"
);
function App() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let chain = async () => {
      const chainid = await web3.eth.getChainId();
      if (chainid !== 56) {
        setOpen(true);
      }
    };
    chain();
  }, []);
  return (
    <>
      <NetworkChange open={open} setOpen={setOpen} />
      <Header />
      <Staking />
    </>
  );
}

export default App;
