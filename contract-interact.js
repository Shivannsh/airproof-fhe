import fs from "fs";
import path, { resolve } from "path";
import logger from "./utils/logger.js";
import { getEnvironmentVariables } from "./utils/env.js";
import { deriveWalletsAndDetails } from "./utils/wallet.js";
import { generateId, getId , getAddress } from "./test/IdMapping.js";
import { registerIdentity } from "./test/PassportID.js";

let { networkUrl, mnemonic } = getEnvironmentVariables();
let { privateKeyTest } = deriveWalletsAndDetails(mnemonic);
console.log(privateKeyTest)
let contractName = "PassportID.sol";
let filename = contractName.split(".")[0];

async function interactWithContract() {
  try {
    const contractAddress = fs.readFileSync(
      path.join(process.cwd(), "data", `${contractName}.txt`),
      "utf8",
    );
// =============================== IdMapping.sol ================================================
    // const generatedId = await generateId(
    //   filename,
    //   networkUrl,
    //   privateKeyTest,
    //   contractAddress,
    // );
    // logger.info(`generateID: ${generatedId}`);
    // await new Promise((resolve) => setTimeout(resolve, 3000));


    // const getIDResult = await getId(
    //   filename,
    //   networkUrl,
    //   privateKeyTest,
    //   contractAddress
    // );
    // logger.info(`getID: ${getIDResult}`);


    // const addressResult = await getAddress(
    //   filename,
    //   networkUrl,
    //   privateKeyTest,
    //   contractAddress
    // );
    // logger.info(`getAddress: ${addressResult}`);
// ================================================================================================


const registerIdentityResult = await registerIdentity(
      filename,
      networkUrl,
      privateKeyTest,
      contractAddress
    );
    logger.info(`registerIdentity: ${registerIdentityResult}`);


    // await decryptMintedTokens(
    //   filename,
    //   networkUrl,
    //   privateKeyTest,
    //   contractAddress,
    // );
    // await new Promise((resolve) => setTimeout(resolve, 3000));

    // await fetchTokenDetails(
    //   filename,
    //   networkUrl,
    //   privateKeyTest,
    //   contractAddress,
    // );
    // await new Promise((resolve) => setTimeout(resolve, 2000));

    // await transferTokens(filename, networkUrl, privateKeyTest, contractAddress);
    // await new Promise((resolve) => setTimeout(resolve, 2000));

    // await reencryptUserBalance(
    //   filename,
    //   networkUrl,
    //   privateKeyTest,
    //   contractAddress,
    // );
    // await new Promise((resolve) => setTimeout(resolve, 2000));

    // const approveResult = await approveTransaction(
    //   filename,
    //   networkUrl,
    //   privateKeyTest,
    //   contractAddress,
    // );
    // logger.info(`Approve Result: ${approveResult}`);
    // await new Promise((resolve) => setTimeout(resolve, 2000));
  } catch (error) {
    logger.error("Error during tests:", error);
  }
}
interactWithContract();
