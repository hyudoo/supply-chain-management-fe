import { ethers } from "ethers";
import { TransactionResponse } from "@ethersproject/abstract-provider";
import BaseInterface from "./BaseInterface";

class Erc721 extends BaseInterface {
  constructor(
    provider: ethers.JsonRpcSigner | ethers.JsonRpcProvider,
    address: string,
    abi: ethers.InterfaceAbi
  ) {
    super(provider, address, abi);
  }

  async totalSupply(): Promise<number> {
    return this._contract.totalSupply();
  }

  async balanceOf(walletAddress: string): Promise<number> {
    const balance = await this._contract.balanceOf(walletAddress);
    return this._toNumber(balance) as number;
  }

  async ownerOf(tokenId: number): Promise<string> {
    return this._contract.ownerOf(tokenId);
  }

  async getApproved(tokenId: string | number): Promise<string> {
    return this._contract.getApproved(tokenId);
  }

  async approve(toAddress: string, tokenId: string | number) {
    return this._contract.approve(toAddress, tokenId);
  }

  async safeTransferFrom(
    fromAddress: string,
    toAddress: string,
    tokenId: string | number
  ): Promise<string> {
    const tx: TransactionResponse = await this._contract[
      "safeTransferFrom(address,address,uint256)"
    ](fromAddress, toAddress, tokenId, this._option);
    return this._handleTransactionResponse(tx);
  }

  async transferFrom(
    fromAddress: string,
    toAddress: string,
    tokenId: string | number
  ): Promise<string> {
    const tx: TransactionResponse = await this._contract.transferFrom(
      fromAddress,
      toAddress,
      tokenId
    );
    return this._handleTransactionResponse(tx);
  }
}

export default Erc721;
