import express from "express";
import auth from "../../middlewares/auth";
import { CustomerControllers } from "./customer.controller";

const router = express.Router();

router.post(
  "/",
  auth("admin"),
  CustomerControllers.createCustomer
);

router.get("/", 
  auth("admin"), 
  CustomerControllers.getAllCustomers);

router.get(
  "/:id",
  // auth("admin","admin"),
  CustomerControllers.getSingleCustomer
);

router.delete("/:id", auth("admin"), CustomerControllers.deleteCustomer);

router.patch(
  "/:id",
  auth("admin","admin"),
  CustomerControllers.updateCustomer
);


export const CustomerRoutes = router;
