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
    console.log()
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
    console.log(privateKey)
    const wallet = new ethers.Wallet(privateKey);
    const address = wallet.address
    console.log(address.toString())
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
    console.log()
    return address.toString();
  } catch (error) {
    handleError("getID", error);
    throw error;
  }
};

// export const transferTokens = async (
//   filename,
//   networkUrl,
//   privateKey,
//   contractAddress,
// ) => {
//   try {
//     const { contract, wallet } = await initializeContract(
//       filename,
//       networkUrl,
//       privateKey,
//       contractAddress,
//     );
//     const fhevmInstance = await createInstance();

//     const encryptedInput = fhevmInstance.createEncryptedInput(
//       contractAddress,
//       wallet.address,
//     );
//     encryptedInput.add64(1337);
//     const encryptedInputs = encryptedInput.encrypt();

//     const transaction = await contract["transfer(address,bytes32,bytes)"](
//       wallet.address,
//       encryptedInputs.handles[0],
//       encryptedInputs.inputProof,
//     );

//     logger.info(`Tx Receipt: ${transaction.hash}`);
//     return transaction.hash;
//   } catch (error) {
//     handleError("transferTokens", error);
//     throw error;
//   }
// };

// export const reencryptUserBalance = async (
//   filename,
//   networkUrl,
//   privateKeyA,
//   contractAddress,
// ) => {
//   try {
//     const { contract, wallet } = await initializeContract(
//       filename,
//       networkUrl,
//       privateKeyA,
//       contractAddress,
//     );
//     const instance = await createInstance();

//     const { publicKey, privateKeyB } = instance.generateKeypair();
//     const eip712 = instance.createEIP712(publicKey, contractAddress);
//     const signature = await wallet.signTypedData(
//       eip712.domain,
//       { Reencrypt: eip712.types.Reencrypt },
//       eip712.message,
//     );
//     const balance = await contract.balanceOf(wallet.address);
//     logger.info(`Balance: ${balance}`);

//     const userBalance = await instance.reencrypt(
//       balance,
//       privateKeyB,
//       publicKey,
//       signature.replace("0x", ""),
//       contractAddress,
//       wallet.address,
//     );

//     logger.info(`User Balance: ${userBalance}`);
//   } catch (error) {
//     handleError("reencryptUserBalance", error);
//     throw error;
//   }
// };

// export const approveTransaction = async (
//   filename,
//   networkUrl,
//   privateKey,
//   contractAddress,
// ) => {
//   try {
//     const { contract, wallet } = await initializeContract(
//       filename,
//       networkUrl,
//       privateKey,
//       contractAddress,
//     );
//     const fhevmInstance = await createInstance();

//     const encryptedInput = fhevmInstance.createEncryptedInput(
//       contractAddress,
//       wallet.address,
//     );
//     encryptedInput.add64(1337);
//     const encryptedInputs = encryptedInput.encrypt();

//     const transaction = await contract["approve(address,bytes32,bytes)"](
//       wallet.address,
//       encryptedInputs.handles[0],
//       encryptedInputs.inputProof,
//     );

//     return transaction.hash;
//   } catch (error) {
//     handleError("approveTransaction", error);
//     throw error;
//   }
// };
