require('dotenv').config();

import { PublicKey } from "@solana/web3.js";
import * as searcher from '../sdk/block-engine/searcher.js';
import { keypair } from "./mysolana.js";
import { buyToken } from "./buysell.js";
import {log, logJSON} from "./utils.js";
import { initPools } from "./pools.js";
import { initBlockhashUpdater } from "./blockhashUpdater.js";
import { initTelegramBot } from "./telegramBot.js";

let usedContracts : Set<string> = new Set<string>();

async function initAll() {

  const blockEngineUrl = process.env.BLOCK_ENGINE_URL || '';
  log('BLOCK_ENGINE_URL:', blockEngineUrl);

  const c = searcher.searcherClient(blockEngineUrl, keypair);

  let leader = await c.getNextScheduledLeader();
  logJSON(leader);

  //log("Init pools...")
  //await initPools();

  //log("Init blockhash updater...")
  //await initBlockhashUpdater();

  log("Init telegram bot...")
  await initTelegramBot();
}

export function onContractFound(contract : PublicKey) {
  console.log("Contract found: ", contract.toString());
  if (usedContracts.has(contract.toString())) return;
  buyToken(contract, 1000, true);
  usedContracts.add(contract.toString());
}

initAll();
