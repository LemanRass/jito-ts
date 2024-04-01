require('dotenv').config();

import {Keypair, Connection, PublicKey} from '@solana/web3.js';
import * as Fs from 'fs';

import * as searcher from '../../sdk/block-engine/searcher';

const main = async () => {
  const blockEngineUrl = process.env.BLOCK_ENGINE_URL || '';
  console.log('BLOCK_ENGINE_URL:', blockEngineUrl);

  const authKeypairPath = process.env.AUTH_KEYPAIR_PATH || '';
  console.log('AUTH_KEYPAIR_PATH:', authKeypairPath);
  const decodedKey = new Uint8Array(
    JSON.parse(Fs.readFileSync(authKeypairPath).toString()) as number[]
  );
  const keypair = Keypair.fromSecretKey(decodedKey);


  const c = searcher.searcherClient(blockEngineUrl, keypair);

  const rpcUrl = process.env.RPC_URL || '';
  console.log('RPC_URL:', rpcUrl);
  const conn = new Connection(rpcUrl, 'confirmed');

  let nextLeader = await c.getNextScheduledLeader();
  console.log('next leader:', nextLeader);

};

main()
  .then(() => {
    console.log('Back running:', process.env.ACCOUNTS_OF_INTEREST);
  })
  .catch(e => {
    throw e;
  });
