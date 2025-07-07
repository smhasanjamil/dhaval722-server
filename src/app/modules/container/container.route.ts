import express from "express";
import auth from "../../middlewares/auth";
import { ContainerControllers } from "./container.controller";

const router = express.Router();

router.post(
  "/",
  auth("admin"),
  ContainerControllers.createContainer
);

router.get("/", 
  auth("admin"), 
  ContainerControllers.getAllContainers);

router.get(
  "/:id",
  auth("admin"),
  ContainerControllers.getSingleContainer
);

router.delete("/:id", auth("admin"), ContainerControllers.deleteContainer);

router.patch(
  "/:id",
  auth("admin"),
  ContainerControllers.updateContainer
);


export const ContainerRoutes = router;
