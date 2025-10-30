import express from "express";
import mongoose from "mongoose";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import { Server } from "socket.io";
import { registerApi } from "./routes/index.js";
import { globalErrorMiddleware } from "./middlewares/index.js";

import { ALLOWED_ORIGINS } from "./constants/index.js";
import { registerNotificationSocket } from "./socket.io/notification.js";

const app = express();
const server = http.createServer(app);
app.use(express.json());
app.use(cors({ credentials: true }));

app.set("trust proxy", true);
const port = process.env.PORT || 3000;
dotenv.config();
registerApi(app);
app.use(globalErrorMiddleware);
app.get("/api/health", (req, res) => {
  res.status(200).json("OK");
});
app.use(express.static("public"));

const io = new Server(server,
  {
    cors: { origin: "*" },
    // cors: {
    //   origin: ALLOWED_ORIGINS,
    //   methods: ["GET", "POST"],
    //   credentials: true,
    // },
  }
);
app.set("io", io);
registerNotificationSocket(io);


mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });


server.listen(port, () => {
  console.log(`${process.env.ENVIRONMENT} server is running on port ${port}`);
});