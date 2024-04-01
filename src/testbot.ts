require('dotenv').config();

import {
  Connection,
  Keypair,
  PublicKey
} from "@solana/web3.js";

import * as Fs from "fs";
import {
  SearcherClient,
  searcherClient
} from "./sdk/block-engine/searcher";


let keypair : Keypair;
let searcher : SearcherClient;
let connection : Connection;

function loadKeypair(path: string): Keypair {
  const decodedKey = new Uint8Array(
    JSON.parse(Fs.readFileSync(path).toString()) as number[]
  );
  return Keypair.fromSecretKey(decodedKey);
}

function initSearcherClient(keypair: Keypair): SearcherClient {
  const blockEngineUrl = process.env.BLOCK_ENGINE_URL || '';
  console.log('BLOCK_ENGINE_URL:', blockEngineUrl);
  return searcherClient(blockEngineUrl, keypair);
}

function initSolanaConnection(): Connection {
  const rpcUrl = process.env.RPC_URL || '';
  console.log('RPC_URL:', rpcUrl);
  return new Connection(rpcUrl, 'confirmed');
}

async function getNextLeader(searcher: SearcherClient) {
  return await searcher.getNextScheduledLeader();
}


async function main() {
  keypair = loadKeypair('configs/jito-keypair.json');
  console.log('Public key:', keypair.publicKey.toString());

  searcher = initSearcherClient(keypair);
  connection = initSolanaConnection();

  let nextLeader = await getNextLeader(searcher);
  console.log('next leader:', nextLeader);
}

main();

