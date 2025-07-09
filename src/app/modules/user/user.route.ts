import express from "express";
import { handleResetPassword, sendResetOTP, UserControllers } from "./user.controller";
import auth from "../../middlewares/auth";

const router = express.Router();

router.post(
  "/",
  auth("admin"),
  UserControllers.createUser
);

router.get("/", 
  auth("admin"), 
  UserControllers.getAllUsers);

router.get(
  "/:id",
  auth("admin", "salesUser", "warehouseUser", "driver"),
  UserControllers.getSingleUser
);

router.delete("/:id", auth("admin"), UserControllers.deleteUser);

router.patch(
  "/:id",
  auth("admin", "salesUser", "warehouseUser", "driver"),
  UserControllers.updateUser
);

router.patch(
  "/change-password/:id",
  auth("admin", "salesUser", "warehouseUser", "driver"),
  UserControllers.changePassword
);

router.post("/forgot-password", sendResetOTP);
router.post("/reset-password", handleResetPassword);

export const UserRoutes = router;
