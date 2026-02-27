import { ethers } from "hardhat";

async function main() {
  const RobinFi = await ethers.getContractFactory("RobinFi");
  const robinfi = await RobinFi.deploy();
  await robinfi.waitForDeployment();
  console.log("RobinFi deployed to:", await robinfi.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});