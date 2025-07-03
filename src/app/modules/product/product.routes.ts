import { Router } from "express";
import validateRequest from "../../middlewares/validateRequest";
import { ProductController } from "./product.controller";
import { productValidation } from "./product.validation";

const router = Router();

router.get("/", ProductController.getAllProducts);
router.get("/:id", ProductController.getSingleProduct);

router.post(
  "/create",
  validateRequest(productValidation.createProductValidationSchema),
  ProductController.createProduct
);

router.patch(
  "/:id",
  validateRequest(productValidation.updateProductValidationSchema),
  ProductController.updateProduct
);

router.delete("/:id", ProductController.deleteProduct);


export const ProductRoutes = router;
