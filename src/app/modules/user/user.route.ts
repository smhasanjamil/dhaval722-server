import express from "express";
import { UserControllers } from "./user.controller";
import auth from "../../middlewares/auth";

const router = express.Router();

router.post(
  "/",
  auth("superAdmin"),
  UserControllers.createUser
);

router.get("/", 
  auth("superAdmin"), 
  UserControllers.getAllUsers);

router.get(
  "/:id",
  auth("superAdmin","admin"),
  UserControllers.getSingleUser
);

router.delete("/:id", auth("superAdmin"), UserControllers.deleteUser);

router.patch(
  "/:id",
  auth("superAdmin","admin"),
  UserControllers.updateUser
);

router.patch(
  "/change-password/:id",
  auth("superAdmin","admin"),
  UserControllers.changePassword
);

export const UserRoutes = router;
