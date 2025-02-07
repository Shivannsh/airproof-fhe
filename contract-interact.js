import fs from "fs";
import path, { resolve } from "path";
import logger from "./utils/logger.js";
import { getEnvironmentVariables } from "./utils/env.js";
import { deriveWalletsAndDetails } from "./utils/wallet.js";
import { generateId, getId , getAddress , resetIdForAddress } from "./test/IdStorage.js";
import { getIdentity,registerIdentity,generateClaim, getBirthdate , getMyIdentityFirstname } from "./test/UserID.js";
let { networkUrl, mnemonic } = getEnvironmentVariables();
let { privateKeyTest } = deriveWalletsAndDetails(mnemonic);
let contractName = "UserID.sol";
let filename = contractName.split(".")[0];

async function interactWithContract() {
  try {
    const contractAddress = fs.readFileSync(
      path.join(process.cwd(), "data", `${contractName}.txt`),
      "utf8",
    );

// =============================== IdStorage.sol ================================================
   
    // const generatedId = await generateId(
    //   filename,
    //   networkUrl,
    //   privateKeyTest,
    //   contractAddress,
    // );
    // logger.info(`generateID TransactionHash : ${generatedId}`);
    // await new Promise((resolve) => setTimeout(resolve, 3000));


    // const getIDResult = await getId(
    //   filename,
    //   networkUrl,
    //   privateKeyTest,
    //   contractAddress
    // );
    // logger.info(`getID Output: ${getIDResult}`);


    // const addressResult = await getAddress(
    //   filename,
    //   networkUrl,
    //   privateKeyTest,
    //   contractAddress
    // );
    // logger.info(`getAddress output: ${addressResult}`);

    // const removeIdResult = await resetIdForAddress(
    //   filename,
    //   networkUrl,
    //   privateKeyTest,
    //   contractAddress
    // );
    // logger.info(`resetIdForAddress transactionHash: ${removeIdResult}`);

// ================================================================================================


// =============================== UserID.sol ====================================================

const registerIdentityResult = await registerIdentity(
      filename,
      networkUrl,
      privateKeyTest,
      contractAddress
    );
    logger.info(`registerIdentity: ${registerIdentityResult}`);


const getIdentityResult = await getIdentity(
  filename,
  networkUrl,
  privateKeyTest,
  contractAddress
);
logger.info(`getIdentity: ${getIdentityResult}`);

const birthdate = await getBirthdate(
  filename,
  networkUrl,
  privateKeyTest,
  contractAddress
);
logger.info(`getBirthdate: ${birthdate}`);

const getMyIdentityFirstnameResult = await getMyIdentityFirstname(
  filename,
  networkUrl,
  privateKeyTest,
  contractAddress
);
logger.info(`getMyIdentityFirstname: ${getMyIdentityFirstnameResult}`)

const generateClaimResult = await generateClaim(
  filename,
  networkUrl,
  privateKeyTest,
  contractAddress,  
);
logger.info(`generateClaim: ${generateClaimResult}`)

// ================================================================================================

  } catch (error) {
    logger.error("Error during tests:", error);
  }
}

interactWithContract();