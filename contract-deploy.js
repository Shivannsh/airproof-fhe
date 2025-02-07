import fs from "fs";
import path from "path";
import logger from "./utils/logger.js";
import { getEnvironmentVariables } from "./utils/env.js";
import { deriveWalletsAndDetails } from "./utils/wallet.js";
import { deployContract } from "./src/deploy.js";

let { networkUrl, mnemonic } = getEnvironmentVariables();
let { privateKeyTest } = deriveWalletsAndDetails(mnemonic);
// let contractName = "IdStorage.sol";
// let contractName = "UserID.sol";
let contractName = "CitizenClaim.sol";

async function deployAndSave() {
  try {
    const UserIDContractAddress = "0xbE597ddB9fC5D9d37df0Ed1cf2b920317fFFCd49";
    const IdStorageContractAddress = "0x1c4988260fECAE86dc4d83a5Bd190C36ECb222e1";
    // const CitizenClaim = "0x41EFF6219D7606c58302000AdE8b9b3477EB0cC2";
    

    logger.boldinfo("========== DEPLOYING USER CONTRACT ==========");

    const { contract } = await deployContract(
      networkUrl,
      privateKeyTest,
      contractName,
      [IdStorageContractAddress, UserIDContractAddress],
    );
    const contractAddress = await contract.getAddress();

    const filePath = path.join(process.cwd(), "data", `${contractName}.txt`);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, contractAddress);

    logger.boldinfo("✅ Contract deployed successfully and address saved!");
  } catch (error) {
    logger.error("❌ Deployment failed:", error);
  }
}

deployAndSave();
