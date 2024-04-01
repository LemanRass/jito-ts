require('dotenv').config();

import * as fs from "fs";
import { PublicKey } from "@solana/web3.js";
import axios from "axios";
import {log} from './utils.js';
import * as proxies from './proxies.js';
import fakeUa from "fake-useragent";

let pools : Map<string, Pool> = new Map<string, Pool>();
let runningCount = 0;
const MAX_RUNNING_COUNT = 5;

class Pool {
  id: PublicKey;
  baseMint: PublicKey;
  quoteMint: PublicKey;
  lpMint: PublicKey;
  baseDecimals: number;
  quoteDecimals: number;
  lpDecimals: number;
  version: number;
  programId: PublicKey;
  authority: PublicKey;
  openOrders: PublicKey;
  targetOrders: PublicKey;
  baseVault: PublicKey;
  quoteVault: PublicKey;
  withdrawQueue: PublicKey;
  lpVault: PublicKey;
  marketVersion: number;
  marketProgramId: PublicKey;
  marketId: PublicKey;
  marketAuthority: PublicKey;
  marketBaseVault: PublicKey;
  marketQuoteVault: PublicKey;
  marketBids: PublicKey;
  marketAsks: PublicKey;
  marketEventQueue: PublicKey;
  lookupTableAccount?: PublicKey;

  public constructor(rawPool : any) {
    this.id = new PublicKey(rawPool.id);
    this.baseMint = new PublicKey(rawPool.baseMint);
    this.quoteMint = new PublicKey(rawPool.quoteMint);
    this.lpMint = new PublicKey(rawPool.lpMint);
    this.baseDecimals = rawPool.baseDecimals;
    this.quoteDecimals = rawPool.quoteDecimals;
    this.lpDecimals = rawPool.lpDecimals;
    this.version = rawPool.version;
    this.programId = new PublicKey(rawPool.programId);
    this.authority = new PublicKey(rawPool.authority);
    this.openOrders = new PublicKey(rawPool.openOrders);
    this.targetOrders = new PublicKey(rawPool.targetOrders);
    this.baseVault = new PublicKey(rawPool.baseVault);
    this.quoteVault = new PublicKey(rawPool.quoteVault);
    this.withdrawQueue = new PublicKey(rawPool.withdrawQueue);
    this.lpVault = new PublicKey(rawPool.lpVault);
    this.marketVersion = rawPool.marketVersion;
    this.marketProgramId = new PublicKey(rawPool.marketProgramId);
    this.marketId = new PublicKey(rawPool.marketId);
    this.marketAuthority = new PublicKey(rawPool.marketAuthority);
    this.marketBaseVault = new PublicKey(rawPool.marketBaseVault);
    this.marketQuoteVault = new PublicKey(rawPool.marketQuoteVault);
    this.marketBids = new PublicKey(rawPool.marketBids);
    this.marketAsks = new PublicKey(rawPool.marketAsks);
    this.marketEventQueue = new PublicKey(rawPool.marketEventQueue);
    this.lookupTableAccount = rawPool.lookupTableAccount ? new PublicKey(rawPool.lookupTableAccount) : undefined;
  }
}

function remapPools(rawPools : any) {
  pools.clear();
  for (let i = 0; i < rawPools.official.length; i++) {
    let key = rawPools.official[i].baseMint + rawPools.official[i].quoteMint;
    pools.set(key, new Pool(rawPools.official[i]));
  }

  for (let i = 0; i < rawPools.unOfficial.length; i++) {
    let key = rawPools.unOfficial[i].baseMint + rawPools.unOfficial[i].quoteMint;
    pools.set(key, new Pool(rawPools.unOfficial[i]));
  }
}

export function findPool(fromMintAddress : PublicKey, toMintAddress : PublicKey) {
  let key = fromMintAddress.toString() + toMintAddress.toString();

  if (pools.has(key)) {
    return pools.get(key);
  }

  key = toMintAddress.toString() + fromMintAddress.toString();
  if (pools.has(key)) {
    return pools.get(key);
  }

  return undefined;
}


async function updateLiquidityPool() {
  runningCount++;

  let proxy = proxies.getProxy();

  try {
    // Setup the https agent
    //utils.log('[' + proxy.host + ':' + proxy.port + '] Fetching Raydium pools... Running count:' + runningCount);
    const url = process.env.RAYDIUM_LIQUIDITY_URL || '';
    const response = await axios.get(url, {
      httpsAgent: proxy.getAgent(),
      headers: {
        'sec-ch-ua': '"Chromium";v="141", "Not(A:Brand";v="21", "Google Chrome";v="111"',
        'Referer': 'https://raydium.io/',
        'DNT': '1',
        'sec-ch-ua-mobile': '?0',
        'User-Agent': fakeUa(),
        'sec-ch-ua-platform': '"Windows"'
      }
    });
    //Save to file
    //const filePath = __dirname + process.env.RAYDIUM_LIQUIDITY_FILE || '';
    //log(`Selected path: ${filePath}`);
    //fs.writeFileSync(filePath, JSON.stringify(response.data, null, 2));
    remapPools(response.data);
    log(`[${proxy.toString()}] Raydium pools update SUCCESS!`);
  } catch (error) {
    log(`[${proxy.toString()}] Raydium pools update FAILED!`, error);
  } finally {
    runningCount--;
    onLiquidityPoolUpdateFinished();
  }
}

function onLiquidityPoolUpdateFinished() {
  for (let i = runningCount; i < MAX_RUNNING_COUNT; i++) {
    updateLiquidityPool();
  }
}

function delay(ms : number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function initPools() {
  for (let i = 0; i < MAX_RUNNING_COUNT; i++) {
    setTimeout(function () {updateLiquidityPool();}, 1000 * i);
  }
  while (pools.size == 0) {
    await delay(1000);
  }
}
