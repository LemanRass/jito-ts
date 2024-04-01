// Import necessary modules
import { Keypair } from '@solana/web3.js';
import * as fs from 'fs';
import * as path from 'path';

// Function to generate a new Solana keypair and save it in JSON
const generateAndSaveKeypair = () => {
  // Generate a new keypair
  const keypair = Keypair.generate();

  // Convert the private key (including the public key) to an array
  const keypairArray = Array.from(keypair.secretKey);

  // Convert the array to JSON
  const keypairJson = JSON.stringify(keypairArray);

  // Specify the file path (adjust the filename as necessary)
  const filePath = path.join(__dirname, '../configs/jito-keypair.json');

  // Write the JSON to the file
  fs.writeFile(filePath, keypairJson, (err) => {
    if (err) {
      console.error('Error saving keypair:', err);
      return;
    }
    console.log('Keypair generated:', keypair.publicKey.toString());
    console.log('Keypair saved to:', filePath);
  });
};

// Run the function
generateAndSaveKeypair();
