import { Router } from "express";
import { ProspectControllers } from "./prospect.controller";

const router = Router();

router.get("/", ProspectControllers.getAllProspects);
router.get("/:id", ProspectControllers.getSingleProspect);

router.post(
  "/",
  // validateRequest(productValidation.createProductValidationSchema),
  ProspectControllers.createProspect
);

router.patch(
  "/:id",
//   validateRequest(productValidation.updateProductValidationSchema),
  ProspectControllers.updateProspect
);

router.delete("/:id", ProspectControllers.deleteProspect);

router.post(
  "/:id/make-customer",
  ProspectControllers.makeCustomer
);

export const ProspectRoutes = router;
