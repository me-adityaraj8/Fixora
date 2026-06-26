import express from "express";
import * as serviceController from "../controllers/service.controller.js";

const router = express.Router();

const fetchAllFn = serviceController.getAllServices || serviceController.getServices || serviceController.fetchAllServices;

router.get('/all', fetchAllFn);
router.get('/:id', serviceController.getServiceById);

if (serviceController.createService) router.post('/', serviceController.createService);
if (serviceController.updateService) router.put('/:id', serviceController.updateService);
if (serviceController.deleteService) router.delete('/:id', serviceController.deleteService);

export default router;
