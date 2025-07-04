import express from "express";
import auth from "../../middlewares/auth";
import { OrderControllers } from "./order.controller";

const router = express.Router();

router.post(
  "/",
  auth("admin","salesUser"),
  OrderControllers.createOrder
);

router.get("/", 
  auth("admin","salesUser"), 
 OrderControllers.getAllOrders);

router.get(
  "/:id",
  auth("admin","salesUser"),
  OrderControllers.getSingleOrder
);

router.delete("/:id", auth("admin"), OrderControllers.deleteOrder);

router.patch(
  "/:id",
  auth("admin","salesUser"),
  OrderControllers.updateOrder
);


export const OrderRoutes = router;
