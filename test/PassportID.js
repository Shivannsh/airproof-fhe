import { JsonRpcProvider, Wallet, Contract } from "ethers";
import { createInstance } from "../utils/create-instance.js";
import { loadABI } from "../utils/load-abi.js";
import logger from "../utils/logger.js";
const PassportIDAddress = "0x319C2E9ed2425c8253207F9a52909289A123c783";
const IdMappingAddress = "0x440300FfA6C851b595fE2e400CC92E1cd094645A";

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

export const registerIdentity = async (
  filename,
  networkUrl,
  privateKey,
  contractAddress,
) => {
  try {
    const { contract, wallet } = await initializeContract(
      filename,
      networkUrl,
      privateKey,
      contractAddress,
      [IdMappingAddress]
    );
    // Create FHEVM instance for encryption
    const fhevmInstance = await createInstance();
    // Prepare encrypted input
    const encryptedInput = fhevmInstance.createEncryptedInput(
      contractAddress,
      wallet.address,
    );
    encryptedInput.addBytes256("ShivanshGupta")
    encryptedInput.add64(949837716);
    const encryptedInputs = await encryptedInput.encrypt();

    // Execute encrypted transfer
    const transaction = await contract.registerIdentity(
      1,
      encryptedInputs.handles[0],
      encryptedInputs.handles[1],
      encryptedInputs.inputProof,
    );

    return transaction;
  } catch (error) {
    logger.error(`Identity Registration Err25o: ${error.message}`);
  }
};
