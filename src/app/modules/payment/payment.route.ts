import express from "express";
import auth from "../../middlewares/auth";
import { PaymentControllers } from "./payment.controller";

const router = express.Router();

router.post(
  "/",
  auth("admin"),
  PaymentControllers.createPayment
);

router.get("/", 
  auth("admin"), 
 PaymentControllers.getAllPayments);

router.get(
  "/:id",
  auth("admin"),
  PaymentControllers.getSinglePayment
);

router.delete("/:id", auth("admin"), PaymentControllers.deletePayment);

router.patch(
  "/:id",
  auth("admin"),
  PaymentControllers.updatePayment
);


export const PaymentRoutes = router;
