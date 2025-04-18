// import { TelegramClient } from "telegram";
// import { StringSession } from "telegram/sessions/index.js";
// import { createInterface } from "readline/promises";
// import dotenv from "dotenv";
// import express from "express";
// import cors from "cors";
// import path from "path";
// import fetchImages from "./fetchImages.js";

// dotenv.config();
// const apiId = Number(process.env.TG_API_ID);
// const apiHash = process.env.TG_API_HASH;
// const domain = process.env.DOMAIN;
// const port = Number(process.env.PORT);
// const stringSession = new StringSession(process.env.TG_STRING_SESSION);
// const phoneNumber = String(process.env.PHONE_NUMBER);

// // const rl = createInterface({
// //   input: process.stdin,
// //   output: process.stdout,
// // });

// const client = new TelegramClient(new StringSession(""), apiId, apiHash, {
//   connectionRetries: 5,
// });
// await client.start({
//   phoneNumber: phoneNumber,
//   password: async () => await rl.question("password: "),
//   phoneCode: async () =>  await rl.question("code: "),
//   onError: (err) => {console.error(err)},
// });

// const app = express();
// app.use(cors());
// app.use(express.json());
// app.use(express.static("public"));

// app.use('/images', express.static(path.join(process.cwd(), 'images')));

// app.get("/fetch-images/:channelTag", async (req, res) => {
//   const channelTag = req.params.channelTag;
//   const start = Number(req.query.start);
//   const end = Number(req.query.end);
//   const sort = Number(req.query.sort);

//   try {
//     const images = await fetchImages(client ,channelTag, start, end, sort, domain, port);

//     res.json(images);
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Ошибка при получении изображений");
//   }
// });

// const server = app.listen(port);
// console.log(`Сервер запущен ${domain}:${port}`);

import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import { createInterface } from "readline/promises"; // Используем промис-версию
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
const phoneNumber = String(process.env.PHONE_NUMBER);

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

const client = new TelegramClient(stringSession, apiId, apiHash, {
  connectionRetries: 5,
});

// uncomment line under to get SessionString (and comment client.connect();)
// await authAndSaveSession();
// if u already had an StringSession do nothing
client.connect();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));
app.use("/images", express.static(path.join(process.cwd(), "images")));

app.get("/fetch-images/:channelTag", async (req, res) => {
  const channelTag = req.params.channelTag;
  //first post to fetch (0 is latest)
  const start = Number(req.query.start);
  // last post in sequence
  const end = Number(req.query.end);
  // sort -1 : first posts with least reactions amount
  // sort 1 : first posts with the most reactions amount
  // sort 0 : first newer posts
  const sort = Number(req.query.sort);

  try {
    const images = await fetchImages(
      client,
      channelTag,
      start,
      end,
      sort,
      domain,
      port
    );
    res.json(images);
  } catch (error) {
    console.error(error);
    res.status(500).send("Ошибка при получении изображений");
  }
});

const server = app.listen(port, () => {
  console.log(`Сервер запущен ${domain}:${port}`);
});

async function authClient() {
  try {
    await client.start({
      phoneNumber: phoneNumber,
      password: async () => await rl.question("Password: "),
      phoneCode: async () => await rl.question("Code: "),
      onError: (err) => console.error("Auth error:", err),
    });
    console.log("Авторизация успешна!");
  } catch (err) {
    console.error("Ошибка авторизации:", err);
  } finally {
    rl.close();
  }
}

async function authAndSaveSession() {
  await authClient()
  const stringSession = client.session.save();
  console.log("Ваша сессия:", stringSession);
}

