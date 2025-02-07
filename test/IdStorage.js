import { JsonRpcProvider, Wallet, Contract } from "ethers";
import { createInstance } from "../utils/create-instance.js";
import { loadABI } from "../utils/load-abi.js";
import logger from "../utils/logger.js";


import { ethers } from "ethers";

const handleError = (functionName, error) => {
  logger.error(`Error in ${functionName}:`, error);
};

const initializeContract = async (
  filename,
  networkUrl,
  privateKey,
  contractAddress,
) => {
  const abi = loadABI(filename);
  const provider = new JsonRpcProvider(networkUrl);
  const wallet = new Wallet(privateKey, provider);
  const contract = new Contract(contractAddress, abi, wallet);
  return { contract, wallet };
};

export const generateId = async (
  filename,
  networkUrl,
  privateKey,
  contractAddress,
) => {
  try {
    const { contract } = await initializeContract(
      filename,
      networkUrl,
      privateKey,
      contractAddress,
    );
    const transaction = await contract.generateId();
    return transaction.hash;
  } catch (error) {
    handleError("generateId", error);
    throw error;
  }
};

export const getId = async (
  filename,
  networkUrl,
  privateKey,
  contractAddress,
) => {
  try {
    const { contract } = await initializeContract(
      filename,
      networkUrl,
      privateKey,
      contractAddress,
    );
    const wallet = new ethers.Wallet(privateKey);
    const address = wallet.address
    const id = await contract.getId(address);
    return id.toString();
  } catch (error) {
    handleError("getID", error);
    throw error;
  }
  };

export const getAddress = async (
  filename,
  networkUrl,
  privateKey,
  contractAddress,
) => {
  try {
    const { contract } = await initializeContract(
      filename,
      networkUrl,
      privateKey,
      contractAddress,
    );
    const address = await contract.getAddress(1);
    return address.toString();
  } catch (error) {
    handleError("getID", error);
    throw error;
  }
};

export const resetIdForAddress = async (
  filename,
  networkUrl,
  privateKey,
  contractAddress,
) => {
  try {
    const { contract } = await initializeContract(
      filename,
      networkUrl,
      privateKey,
      contractAddress,
    );
    const wallet = new ethers.Wallet(privateKey);
    const address = wallet.address
    const transaction = await contract.resetIdForAddress(address);
    return transaction.hash;
  } catch (error) {
    handleError("resetIdForAddress Error: ", error);
    throw error;
  }
};

