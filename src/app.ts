import cors from "cors";
import express, { Application, NextFunction, Request, Response } from "express";
import cookieParser from "cookie-parser";
import globalErrorHandler from "./app/middlewares/globalErrorhandler";
import router from "./app/routes/route";



const app: Application = express();

// Middleware setup
app.use(cors({ origin: "http://localhost:3000" }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get("/", (req: Request, res: Response) => {
  res.send("Server is running!");
});

app.use("/api/v1", router);

app.use(globalErrorHandler);



export default app;