const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("🚀 Deploying with account:", deployer.address);

  // 1. Deploy Mock Token (Mint 1 Million tokens to deployer)
  const initialSupply = hre.ethers.parseUnits("1000000", 18); // 1M tokens
  const MockToken = await hre.ethers.getContractFactory("MockToken");
  const mockToken = await MockToken.deploy(initialSupply);
  await mockToken.waitForDeployment();
  const tokenAddress = await mockToken.getAddress();
  console.log("💰 MockToken deployed to:", tokenAddress);

  // 2. Deploy Crowdfunding (Pass the Token Address)
  const Crowdfunding = await hre.ethers.getContractFactory("Crowdfunding");
  const crowdfunding = await Crowdfunding.deploy(tokenAddress);
  await crowdfunding.waitForDeployment();
  const cfAddress = await crowdfunding.getAddress();
  console.log("🏛️ Crowdfunding deployed to:", cfAddress);

  // 3. Save Contract Addresses & ABI for Frontend
  const contractsDir = path.join(__dirname, "..", "..", "frontend", "src", "contracts");
  
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true });
  }

  // Save Addresses
  const addressData = {
    Crowdfunding: cfAddress,
    MockToken: tokenAddress
  };
  fs.writeFileSync(
    path.join(contractsDir, "contract-address.json"),
    JSON.stringify(addressData, null, 2)
  );

  // Save ABIs
  const CrowdfundingArtifact = await hre.artifacts.readArtifact("Crowdfunding");
  fs.writeFileSync(
    path.join(contractsDir, "Crowdfunding.json"),
    JSON.stringify(CrowdfundingArtifact, null, 2)
  );

  const MockTokenArtifact = await hre.artifacts.readArtifact("MockToken");
  fs.writeFileSync(
    path.join(contractsDir, "MockToken.json"),
    JSON.stringify(MockTokenArtifact, null, 2)
  );

  console.log("✅ Frontend files generated!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});