import cors from "cors";
import express, { Application, NextFunction, Request, Response } from "express";
import cookieParser from "cookie-parser";
import globalErrorHandler from "./app/middlewares/globalErrorhandler";
import router from "./app/routes/route";



const app: Application = express();

// Middleware setup
// Allow all origins, methods, and credentials if needed
app.use(cors({
  origin: "*", // or specify origins array in production
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true, // if you plan to use cookies with CORS
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get("/", (req: Request, res: Response) => {
  res.send("Server is running!");
});

app.use("/api/v1", router);

app.use(globalErrorHandler);



export default app;