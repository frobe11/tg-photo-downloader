import { message } from "telegram/client/index.js";

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
  const allMessages = await client.getMessages(channel, { limit: 10000 });
  const messages = allMessages.filter((message) => message.photo);
  if (end > messages.length) {
    console.error(
      `end: ${end} is greater than messages length: ${messages.length}`
    );
    throw new Error(
      `end: ${end} is greater than messages length: ${messages.length}`
    );
  }
  if (sort) {
    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
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
      const filePath = `images\\${channelTag}_${i}.jpg`;
      const fileUrl = `${domain}:${port}/images/${channelTag}_${i}.jpg`;
      tempResult.push({
        file: file,
        filePath: filePath,
        fileUrl: fileUrl,
        caption: caption,
        rating: rating,
        id: i,
      });
    }
    tempResult.sort((first, second) => sort * (second.rating - first.rating));
    for (let i = start; i < end; i++) {
      result.push(tempResult[i]);
      await downloadImage(client, tempResult[i].file, tempResult[i].filePath);
    }
  } else {
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
      const filePath = `images\\${channelTag}_${i}.jpg`;
      const fileUrl = `${domain}:${port}/images/${channelTag}_${i}.jpg`;
      result.push({
        file: file,
        filePath: filePath,
        fileUrl: fileUrl,
        caption: caption,
        rating: rating,
        id: i,
      });
      console.log(start,end,i,result.length)
      await downloadImage(client, result[i-start].file, result[i-start].filePath);
    }
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
