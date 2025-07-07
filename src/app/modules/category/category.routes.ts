import { Router } from "express";
import { CategoryController } from "./category.controller";
import validateRequest from "../../middlewares/validateRequest";
import { categoryValidation } from "./category.validation";

const router = Router();

router.get("/", CategoryController.getAllCategories);

router.get("/:id", CategoryController.getCategoryById);

router.post(
  "/",
  validateRequest(categoryValidation.createCategoryValidationSchema),
  CategoryController.createCategory
);

router.patch(
  "/:id",
  validateRequest(categoryValidation.updateCategoryValidationSchema),
  CategoryController.updateCategory
);

router.delete("/:id", CategoryController.deleteCategory);

export const CategoryRoutes = router;
