import fs from "fs";
import path from "path";
import logger from "./utils/logger.js";
import { getEnvironmentVariables } from "./utils/env.js";
import { deriveWalletsAndDetails } from "./utils/wallet.js";
import { deployContract } from "./src/deploy.js";

let { networkUrl, mnemonic } = getEnvironmentVariables();
let { privateKeyTest } = deriveWalletsAndDetails(mnemonic);
let contractName = "EmployerClaim.sol";

async function deployAndSave() {
  try {
    const PassportIDAddress = "0x3a85dfB71Dbe97bA9F5af4f82EcCCaEab855Cc73";
    const IdMappingAddress = "0x786FA365fc8b2161Fa66DB74d50930aD71061245";
    // const EmployerClaim = "0x8d63ADfdb58f7122bBED6a6cbd5cae6CDA4eF59e";
    

    logger.boldinfo("========== DEPLOYING USER CONTRACT ==========");

    const { contract } = await deployContract(
      networkUrl,
      privateKeyTest,
      contractName,
      [IdMappingAddress,PassportIDAddress]
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
