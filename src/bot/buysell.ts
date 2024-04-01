import {
  PublicKey,
  TransactionMessage,
  ComputeBudgetProgram,
  VersionedTransaction,
} from '@solana/web3.js';
import {
  Liquidity,
} from '@raydium-io/raydium-sdk';
import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountIdempotentInstruction,
} from '@solana/spl-token';
import { findPool,} from './pools.js';
import {log, logJSON} from './utils.js';
import {connection, keypair} from "./mysolana.js";
import {getLatestBlockhash} from "./blockhashUpdater.js";


export async function buyToken(toToken: PublicKey, amount: number, isDebug: boolean) {

  let fromToken : PublicKey = new PublicKey('So11111111111111111111111111111111111111112');

  try {
    if (isDebug) {
      log('From: ', fromToken);
      log('To: ', toToken);
    }

    log('Searching pool...');

    let pool = findPool(fromToken, toToken);

    if (!pool) {
      log('Pool not found');
      return;
    }

    pool.baseMint = fromToken;
    pool.quoteMint = toToken;

    if (isDebug) {
      log(`[Pool] From: ${pool.baseMint}, To: ${pool.quoteMint}`)
      logJSON(pool);
    }

    log('Getting or creating token accounts...');

    const userFromTokenAccount = await getAssociatedTokenAddress(
      pool.baseMint,
      keypair.publicKey
    );

    const userToTokenAccount = await getAssociatedTokenAddress(
      pool.quoteMint,
      keypair.publicKey
    );

    if (isDebug) {
      log("");
      log('User from token account:', userFromTokenAccount.toString());
      log('User to token account:', userToTokenAccount.toString());
    }

    const { innerTransaction} = Liquidity.makeSwapFixedInInstruction(
      {
        poolKeys: pool as any,
        userKeys: {
          tokenAccountIn: userFromTokenAccount,
          tokenAccountOut: userToTokenAccount,
          owner: keypair.publicKey
        },
        amountIn: amount,
        minAmountOut: 0,
      },
      pool.version);

    if (isDebug) {
      log("");
      log("Inner transaction: ", JSON.stringify(innerTransaction));
    }


    const latestBlockhash = getLatestBlockhash();//await configs.connection.getLatestBlockhash();
    if (isDebug) {
      log("");
      log("Latest blockhash: ", latestBlockhash.blockhash);
    }

    const rawTransactionMessage = new TransactionMessage({
      payerKey: keypair.publicKey,
      recentBlockhash: latestBlockhash.blockhash,
      instructions: [
        ComputeBudgetProgram.setComputeUnitPrice({microLamports: 100000}),
        ComputeBudgetProgram.setComputeUnitLimit({units: 101337}),
        createAssociatedTokenAccountIdempotentInstruction(
          keypair.publicKey,
          userToTokenAccount,
          keypair.publicKey,
          pool.quoteMint),
        ...innerTransaction.instructions,
      ]
    });

    if (isDebug) {
      log("");
      log("Raw message: ", JSON.stringify(rawTransactionMessage));
    }

    const messageV0 = rawTransactionMessage.compileToV0Message();
    if (isDebug) {
      log("");
      log("Compiled message: ", JSON.stringify(messageV0));
    }

    const transaction = new VersionedTransaction(messageV0);
    if (isDebug) {
      log("");
      log("Versioned transaction: ", JSON.stringify(transaction));
    }

    transaction.sign([keypair, ...innerTransaction.signers]);
    if (isDebug) {
      log("");
      log("Signed transaction: ", JSON.stringify(transaction));
    }

    const signature = await connection.sendRawTransaction(transaction.serialize());
    log("");
    log(`Mint: ${pool.baseMint.toString()}\nSignature: ${signature}`);

  } catch (e) {
    console.error(e);
  }
}
