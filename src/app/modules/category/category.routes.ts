import { Router } from "express";
import { CategoryController } from "./category.controller";
import validateRequest from "../../middlewares/validateRequest";
import { categoryValidation } from "./category.validation";

const router = Router();

router.get("/", CategoryController.getAllCategories);

router.get("/:id", CategoryController.getCategoryById);

router.post(
  "/create",
  validateRequest(categoryValidation.createCategoryValidationSchema),
  CategoryController.createCategory
);

router.patch(
  "/update/:id",
  validateRequest(categoryValidation.updateCategoryValidationSchema),
  CategoryController.updateCategory
);

export const CategoryRoutes = router;
