require('dotenv').config();

import { Api, TelegramClient, sessions } from "telegram";
import { log, tryFindSolanaContract } from "./utils.js";
import { EntityLike } from "telegram/define";
import { onContractFound } from "./main.js";
import { PublicKey } from "@solana/web3.js";

const session = new sessions.StringSession(process.env.TELEGRAM_SESSION || '');
const apiId = parseInt(process.env.TELEGRAM_API_ID || '0');
const apiHash = process.env.TELEGRAM_API_HASH || '';
const channelName = process.env.TELEGRAM_CHANNEL_NAME || '';
const client = new TelegramClient(session, apiId, apiHash, {});

export async function initTelegramBot() {
  await client.connect();

  let channel : Api.Channel = await client.getEntity(channelName) as Api.Channel;
  log("Observed channel: " + channel.id);
  /*let inputChannel : EntityLike = new Api.InputChannel({
    channelId: channel.id,
    accessHash: channel.accessHash!
  });

  const result = await client.invoke(
    new Api.updates.GetChannelDifference({
      channel: inputChannel,
      filter: new Api.ChannelMessagesFilterEmpty(),
      pts: 43,
      limit: 100,
      force: true
    })
  );*/

  client.addEventHandler((update : any) => {
    try {
      if (update instanceof Api.UpdateNewChannelMessage) {
        let newMessageUpdate = update as Api.UpdateNewChannelMessage;
        let peerChannel = newMessageUpdate.message.peerId as Api.PeerChannel;

        if (peerChannel.channelId.toString() !== channel.id.toString()) return;

        let message : Api.Message = newMessageUpdate.message as Api.Message;
        log("New message", message.message);
        newMessageHandler(message.message);
      }

      if (update instanceof Api.UpdateEditChannelMessage) {
        let editMessageUpdate = update as Api.UpdateEditChannelMessage;
        let peerChannel = editMessageUpdate.message.peerId as Api.PeerChannel;

        if (peerChannel.channelId.toString() !== channel.id.toString()) return;

        let message : Api.Message = editMessageUpdate.message as Api.Message;
        log("Message edited", message.message);
        newMessageHandler(message.message);
      }
    } catch (error) {
      log("Error", error)
    }
  });

  log("Client is ready to receive messages...");
  keepAlive();
}

async function newMessageHandler(message : string) {
  if (message) {
    const contract = tryFindSolanaContract(message);
    if (contract) {
      let contractPublicKey = new PublicKey(contract);
      onContractFound(contractPublicKey);
    }
  }
}

async function keepAlive() {
  await client.invoke(new Api.updates.GetState());
  setTimeout(keepAlive, 1000 * 5);
}
