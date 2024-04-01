require('dotenv').config();

import {
  Connection,
  Keypair
} from '@solana/web3.js';

import fs from 'fs';

export const connection = new Connection(
  process.env.SOLANA_RPC_URL || '',
  'confirmed');

export const keypair = Keypair.fromSecretKey(
  new Uint8Array(process.env.AUTH_KEYPAIR ? JSON.parse(process.env.AUTH_KEYPAIR) : []));

