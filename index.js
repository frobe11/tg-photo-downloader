import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import path from "path";
import fetchImages from "./fetchImages.js";

dotenv.config();
const apiId = Number(process.env.TG_API_ID);
const apiHash = process.env.TG_API_HASH;
const domain = process.env.DOMAIN;
const port = Number(process.env.PORT);
const stringSession = new StringSession(process.env.TG_STRING_SESSION);
const client = new TelegramClient(stringSession, apiId, apiHash, {
  connectionRetries: 5,
});
await client.start({
  phoneNumber: "+79817761954",
  password: async () =>
    new Promise((resolve) => rl.question("password: ", resolve)),
  phoneCode: async () =>
    new Promise((resolve) => rl.question("received code: ", resolve)),
  onError: (err) => console.error(err),
});
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public")); 

app.use('/images', express.static(path.join(process.cwd(), 'images')));

app.get("/fetch-images/:channelTag", async (req, res) => {
  const channelTag = req.params.channelTag;
  const start = Number(req.query.start);
  const end = Number(req.query.end);
  const sort = Number(req.query.sort);

  try {
    const images = await fetchImages(client ,channelTag, start, end, sort, domain, port);

    res.json(images);
  } catch (error) {
    console.error(error);
    res.status(500).send("Ошибка при получении изображений");
  }
});

const server = app.listen(port);
console.log(`Сервер запущен ${domain}:${port}`);
