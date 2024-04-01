function formatTimestamp() {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');
  const milliseconds = now.getMilliseconds().toString().padStart(3, '0');
  return `${hours}:${minutes}:${seconds}.${milliseconds}`;
}

export function log(message?: any, ...optionalParams: any[]) {
  console.log(`[${formatTimestamp()}]`, message, ...optionalParams);
}

export function logJSON(json : any) {
  log(`${JSON.stringify(json, null, 2)}`);
}


export function tryFindSolanaContract(text : string) {

  if (text === undefined) return;

  //const shitPattern = /(?:dexscreener|birdeye|prelaunch|Prelaunch)/gm;
  //const shitMatches = text.match(shitPattern);
  //if (shitMatches) return;

  // Define the regular expression pattern
  const pattern = /\b([a-zA-Z0-9]{44})\b/gm;
  const matches = text.match(pattern);
  // If a match is found, return the first one
  if (matches) {
    if (matches[0].startsWith("0x")) return;
    return matches[0]; // Return the first match found
  }

  // Return undefined if no matching string is found in any text
  return undefined;
}
