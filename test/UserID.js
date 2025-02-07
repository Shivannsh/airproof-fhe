import { JsonRpcProvider, Wallet, Contract } from "ethers";
import { createInstance } from "../utils/create-instance.js";
import { loadABI } from "../utils/load-abi.js";
import logger from "../utils/logger.js";

const UserIDContractAddress = "0x8d63ADfdb58f7122bBED6a6cbd5cae6CDA4eF59e";
const IdStorageContractAddress = "0x00d06D3b6fF03fc136646f4e1137B374d3Aa9754";
const CitizenClaimAddress="0x786FA365fc8b2161Fa66DB74d50930aD71061245"

import { ethers } from "ethers";

const handleError = (functionName, error) => {
  logger.error(`Error in ${functionName}:`, error);
};

// Helper function to setup reencryption
async function setupReencryption(instance, signer, contractAddress) {
  const { publicKey, privateKey } = instance.generateKeypair();
  const eip712 = instance.createEIP712(publicKey, contractAddress);
  const signature = await signer.signTypedData(
    eip712.domain,
    { Reencrypt: eip712.types.Reencrypt },
    eip712.message,
  );

  return { publicKey, privateKey, signature: signature.replace("0x", "") };
}

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
      [IdStorageContractAddress],
    );
    // Create FHEVM instance for encryption
    const fhevmInstance = await createInstance();
    // Prepare encrypted input
    const encryptedInput = fhevmInstance.createEncryptedInput(
      contractAddress,
      wallet.address,
    );
    encryptedInput.add64(1234567890);
    encryptedInput.addBytes256("Shivansh");
    encryptedInput.addBytes256("Gupta");
    encryptedInput.add64(949837716);
    const encryptedInputs = await encryptedInput.encrypt();

    // Execute encrypted transfer
    const transaction = await contract.registerIdentity(
      1,
      encryptedInputs.handles[0],
      encryptedInputs.handles[1],
      encryptedInputs.handles[2],
      encryptedInputs.handles[3],
      encryptedInputs.inputProof,
    );

    return transaction;
  } catch (error) {
    logger.error(`registerIdentity Error: ${error.message}`);
  }
};

export const getIdentity = async (
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
      [IdStorageContractAddress],
    );

    // Execute encrypted transfer
    const identity = await contract.getIdentity(1);

    return identity;
  } catch (error) {
    logger.error(`getIdentity Error: ${error.message}`);
  }
};

export const getBirthdate = async (
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
      [IdStorageContractAddress],
    );

    // Execute encrypted transfer
    const birthdate = await contract.getBirthdate(1);
    return birthdate;

  } catch (error) {
    logger.error(`getBirthdate Error: ${error.message}`);
  }
};

export const getMyIdentityFirstname = async (
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
      [IdStorageContractAddress],
    );
    const fhevmInstance = await createInstance();
    let signer = ethers.Wallet.createRandom().connect(ethers.provider);
    // Execute encrypted transfer
    const firstname = await contract.getMyIdentityFirstname(1);
    const { publicKey, privateKey, signature } = await setupReencryption(
      fhevmInstance,
      signer,
      PassportIDAddress,
    );
    const reencryptFirstName = await fhevmInstance.reencrypt(
      firstname,
      privateKey,
      publicKey,
      signature,
      PassportIDAddress,
      wallet.address,
    );
    return reencryptFirstName;
    // return firstname;
  } catch (error) {
    logger.error(`getMyIdentityFirstname Error: ${error.message}`);
  }
};

export const generateClaim = async (
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
      [IdStorageContractAddress],
    );

    const transction = await contract.generateClaim(
      CitizenClaimAddress,
      "generateAdultClaim(uint256)",
    );

    // await except(tx).to.emit(employerClaim,"AdultClaimGenerated");
    // const latestClaimUserId = await employerClaim.lastClaimId();
    // const adultClaim = await employerClaim.getAdultClaim(lastClaimId);

    return transction;
  } catch (error) {
    logger.error(`Claim Genration Error: ${error.message}`);
  }
};