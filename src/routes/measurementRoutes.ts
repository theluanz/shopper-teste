import { Router } from 'express';
import MeasurementController from '../controllers/measurementController';

const router = Router();

router.patch('/confirm', MeasurementController.confirmMeasure);

router.post('/upload', MeasurementController.createMeasurement);

router.get('/:customer_code/list', MeasurementController.getMeasurementsByCustomer);

export default router;
