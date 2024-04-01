"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Import necessary modules
var web3_js_1 = require("@solana/web3.js");
var fs = require("fs");
var path = require("path");
// Function to generate a new Solana keypair and save it in JSON
var generateAndSaveKeypair = function () {
    // Generate a new keypair
    var keypair = web3_js_1.Keypair.generate();
    // Convert the private key (including the public key) to an array
    var keypairArray = Array.from(keypair.secretKey);
    // Convert the array to JSON
    var keypairJson = JSON.stringify(keypairArray);
    // Specify the file path (adjust the filename as necessary)
    var filePath = path.join(__dirname, '/configs/jito-keypair.json');
    // Write the JSON to the file
    fs.writeFile(filePath, keypairJson, function (err) {
        if (err) {
            console.error('Error saving keypair:', err);
            return;
        }
        console.log('Keypair saved to:', filePath);
    });
};
// Run the function
generateAndSaveKeypair();
