import { connection } from './mysolana.js';
import { BlockhashWithExpiryBlockHeight } from "@solana/web3.js";
import { log } from './utils.js';

let latestBlockhash : BlockhashWithExpiryBlockHeight;

export async function initBlockhashUpdater() {
  await updateBlockhash();
  loop();
}

export function getLatestBlockhash() {
  return latestBlockhash;
}

async function updateBlockhash() {
  latestBlockhash = await connection.getLatestBlockhash();
  log('New Blockhash:', latestBlockhash.blockhash);
}

async function loop() {
  try {
    await updateBlockhash();
  } catch (error) {
    log('Failed to update blockhash:', error);
  } finally {
    setTimeout(loop, 1000 *  5); // Update every 5 seconds
  }
}
