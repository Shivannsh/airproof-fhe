import fs from "fs";
import path from "path";
import logger from "./utils/logger.js";
import { getEnvironmentVariables } from "./utils/env.js";
import { deriveWalletsAndDetails } from "./utils/wallet.js";
import { deployContract } from "./src/deploy.js";

let { networkUrl , mnemonic} = getEnvironmentVariables();
// const privateKeyTest = process.env.PRIVATE_KEY_TEST;
let { privateKeyTest } = deriveWalletsAndDetails(mnemonic);
let contractName = "IdMapping.sol";

async function deployAndSave() {
  try {
    const PassportIDAddress = "0x11ED3BF03A9d004A32A590B5B21199EfB991eEB9";
    const IdMappingAddress = "0x4e5F19563ec05170774eCB77B46a90dd34d51390";
    
    logger.boldinfo("========== DEPLOYING USER CONTRACT ==========");

    const { contract } = await deployContract(
      networkUrl,
      privateKeyTest,
      contractName,
      [],
      { gasLimit: 100000000000 }
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
