import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { userRouter } from "./routes/users.js";

const app = express();

app.use(express.json());
app.use(cors());
app.use("/auth", userRouter);

mongoose.connect(
  "mongodb+srv://aurgaonkar:aarav123@quiz.iuj1aba.mongodb.net/"
);

app.listen(3001, () => console.log("SERVER STARTEDDDD"));
