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
    const UserIDContractAddress = "0x8d63ADfdb58f7122bBED6a6cbd5cae6CDA4eF59e";
    const IdStorageContractAddress = "0x00d06D3b6fF03fc136646f4e1137B374d3Aa9754";
    // const CitizenClaim = "0x8d63ADfdb58f7122bBED6a6cbd5cae6CDA4eF59e";
    

    logger.boldinfo("========== DEPLOYING USER CONTRACT ==========");

    const { contract } = await deployContract(
      networkUrl,
      privateKeyTest,
      contractName,
      [IdStorageContractAddress,UserIDContractAddress]
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
