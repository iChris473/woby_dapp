import React from "react";
import { Contract } from "@ethersproject/contracts";
import stakingAbi from "./stakingAbi.json";
import tokenAbi from "./tokenAbi.json";
import { stakingAddress, tokenAddress } from "./environment";
import { ethers } from "ethers";
let walletAddress = "0x8ba1f109551bD432803012645Ac136ddd64DBA72";

const provider = new ethers.providers.JsonRpcProvider(
  "https://bsc-dataseed1.binance.org/"
);

export const voidAccount = new ethers.VoidSigner(walletAddress, provider);
function useContract(address, ABI, signer) {
  return React.useMemo(() => {
    if (signer) {
      return new Contract(address, ABI, signer);
    } else {
      return new Contract(address, ABI, voidAccount);
    }
  }, [address, ABI, signer]);
}

export function useStakingContract(signer) {
  return useContract(stakingAddress, stakingAbi, signer);
}
export function useTokenContract(signer) {
  return useContract(tokenAddress, tokenAbi, signer);
}
