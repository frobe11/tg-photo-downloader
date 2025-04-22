import { message } from "telegram/client/index.js";
import { Api } from "../tl";


// sort -1 : first posts with least reactions amount
// sort 1 : first posts with the most reactions amount
// sort 0 : first newer posts
export default async function fetchImages(
  client,
  channelTag,
  start,
  end,
  sort,
  domain,
  port
) {
  const result = [];
  const tempResult = [];
  const channel = await client.getEntity(channelTag);
  const messages = await client.getMessages(channel, {
    limit: 10000,
    filter: new Api.InputMessagesFilterPhotos(),
  });
  if (end > messages.length) {
    console.error(
      `end: ${end} is greater than messages length: ${messages.length}`
    );
    throw new Error(
      `end: ${end} is greater than messages length: ${messages.length}`
    );
  }

  tempResult = parseMessages(start, end, messages);
  if (sort) {
    tempResult.sort((first, second) => sort * (second.rating - first.rating));
  }
  for (let i = start; i < end; i++) {
    result.push({
      filePath: tempResult[i].filePath,
      fileUrl: tempResult[i].fileUrl,
      caption: tempResult[i].caption,
      rating: tempResult[i].rating,
      id: tempResult[i].id,
    });
    await downloadImage(client, tempResult[i].file, tempResult[i].filePath);
  }

  return result;
}

async function downloadImage(client, file, filePath) {
  try {
    await client.downloadMedia(file, { outputFile: filePath });
  } catch (error) {
    console.error(`error while downloading file: ${filePath}`, error);
    throw error;
  }
}

async function parseMessages(start, end, messages) {
  for (let i = start; i < end; i++) {
    let message = messages[i];
    let rating = 0;
    const file = message.photo;
    const caption = message.message;
    if (!message.reactions) {
      console.log(`No reactions for message: ${message.message}`);
    }
    if (message.reactions && message.reactions.results) {
      message.reactions.results.forEach((result) => {
        rating += result.count;
      });
    }
    const filePath = `images\\${channelTag}_${message.id}.jpg`;
    const fileUrl = `${domain}:${port}/images/${channelTag}_${message.id}.jpg`;
    result.push({
      file: file,
      filePath: filePath,
      fileUrl: fileUrl,
      caption: caption,
      rating: rating,
      id: message.id,
    });
  }
}
