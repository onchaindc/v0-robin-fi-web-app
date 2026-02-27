import { ethers } from "ethers";
import hre from "hardhat";

async function main() {
  // get a provider from hardhat network config
  const provider = new ethers.JsonRpcProvider(
    process.env.ROBINHOOD_RPC_URL || "https://rpc.testnet.chain.robinhood.com"
  );
  // use your hardhat account (from PRIVATE_KEY in .env)
  const pk = process.env.PRIVATE_KEY;
  if (!pk) throw new Error("Missing PRIVATE_KEY in .env");

  const wallet = new ethers.Wallet(pk, provider);

  const artifact = await hre.artifacts.readArtifact("RobinFi");
  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);

  const contract = await factory.deploy();
  await contract.waitForDeployment();

  console.log("RobinFi deployed to:", await contract.getAddress());
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});