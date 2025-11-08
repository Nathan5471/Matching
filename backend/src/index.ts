import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRouter from "./routes/authRouter";
import matchRouter from "./routes/matchRouter";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());

// APIs
app.use("/api/auth", authRouter);
app.use("/api/match", matchRouter);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
