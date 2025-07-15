import { Router } from "express";
import validateRequest from "../../middlewares/validateRequest";
import { ProductController } from "./product.controller";
import { productValidation } from "./product.validation";

const router = Router();

router.get("/by-category/:categoryId", ProductController.getProductsByCategory);
router.get("/", ProductController.getAllProducts);
router.get("/packet-sizes", ProductController.getAllPacketSizes);
router.get("/:id", ProductController.getSingleProduct);



router.post(
  "/",
  // validateRequest(productValidation.createProductValidationSchema),
  ProductController.createProduct
);

router.patch(
  "/:id",
  validateRequest(productValidation.updateProductValidationSchema),
  ProductController.updateProduct
);

router.delete("/:id", ProductController.deleteProduct);


export const ProductRoutes = router;
