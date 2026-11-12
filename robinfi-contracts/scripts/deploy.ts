import { ethers } from "ethers";
import hre from "hardhat";

const STOCK_TOKENS = [
  { symbol: "TSLA", name: "Tesla (Tokenized)" },
  { symbol: "AMZN", name: "Amazon (Tokenized)" },
  { symbol: "NFLX", name: "Netflix (Tokenized)" },
  { symbol: "PLTR", name: "Palantir (Tokenized)" },
  { symbol: "AMD", name: "AMD (Tokenized)" },
];

async function main() {
  const rpcUrl = process.env.ROBINHOOD_RPC_URL || "https://rpc.testnet.chain.robinhood.com";
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const pk = process.env.PRIVATE_KEY;
  if (!pk) throw new Error("Missing PRIVATE_KEY in .env");

  const wallet = new ethers.Wallet(pk, provider);
  console.log("Deploying from:", wallet.address);

  const tokenAddresses: Record<string, string> = {};
  const tokenArtifact = await hre.artifacts.readArtifact("MockStockToken");
  const tokenFactory = new ethers.ContractFactory(
    tokenArtifact.abi,
    tokenArtifact.bytecode,
    wallet
  );

  for (const token of STOCK_TOKENS) {
    const contract = await tokenFactory.deploy(token.name, token.symbol, 0);
    await contract.waitForDeployment();
    tokenAddresses[token.symbol] = await contract.getAddress();
    console.log(`${token.symbol} -> ${tokenAddresses[token.symbol]}`);
  }

  const factoryArtifact = await hre.artifacts.readArtifact("VaultFactory");
  const factory = new ethers.ContractFactory(
    factoryArtifact.abi,
    factoryArtifact.bytecode,
    wallet
  );
  const deployed = await factory.deploy();
  await deployed.waitForDeployment();
  const factoryAddress = await deployed.getAddress();
  console.log("RobinFiFactory deployed to:", factoryAddress);

  console.log("\nFrontend config:");
  console.log(JSON.stringify({ FACTORY_ADDRESS: factoryAddress, STOCK_TOKENS: tokenAddresses }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
