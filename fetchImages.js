import { message } from "telegram/client/index.js";

// sort -1 : first posts with least reactions amount
// sort 1 : first posts with the most reactions amount
// sort 0 : first newer posts
export default async function fetchImages(client, channelTag, start, end, sort) {
  const result = new Set();
  const channel = await client.getEntity(channelTag);
  const messages = await client.getMessages(channel, { limit: 100000 });
  messages.filter((message) => message.photo);
  if (sort) {
    for (let i = 0; i <= messages.count; i++) {
      message = messages[i];
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
      result.add({
        file: file,
        filePath: filePath,
        caption: caption,
        rating: rating,
        id: i,
      });
    }
    result.sort((first, second) => sort * (second.rating - first.rating));
    for (let i = start; i <= end; i++) {
      await downloadImage(client, result[i].file, result[i].filePath);
    }
  } else {
    for (let i = start; i <= end; i++) {
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
      await downloadImage(client, file, filePath);
      result.add({
        file: file,
        filePath: filePath,
        caption: caption,
        rating: rating,
        id: i,
      });
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

