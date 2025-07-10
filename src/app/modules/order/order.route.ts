import express from "express";
import auth from "../../middlewares/auth";
import { OrderControllers } from "./order.controller";

const router = express.Router();

router.post(
  "/",
  // auth("admin"),
  OrderControllers.createOrder
);

router.get(
  "/",
  // auth("admin"),
  OrderControllers.getAllOrders
);

router.get(
  "/orderInvoice/:id",
  // auth("admin"),
  OrderControllers.getOrderInvoicePdf
);

// Get Products Grouped By Category
router.get(
  "/bulk-order-excel-empty",
  OrderControllers.getProductsGroupedByCategory
);

// Best and worst selling product for dashboard
router.get("/best-selling", OrderControllers.getBestSellingProductsController);
router.get(
  "/worst-selling",
  OrderControllers.getWorstSellingProductsController
);

router.get(
  "/:id",
  // auth("admin"),
  OrderControllers.getSingleOrder
);

router.delete("/:id", auth("admin"), OrderControllers.deleteOrder);

router.patch(
  "/:id",
  // auth("admin"),
  OrderControllers.updateOrder
);

export const OrderRoutes = router;
