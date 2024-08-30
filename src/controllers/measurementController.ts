import { Request, Response } from 'express';
import Measurement from '../models/measurement';

class MeasurementController {
  static async createMeasurement(req: Request, res: Response) {}
  static async confirmMeasure(req: Request, res: Response) {}
  static async getMeasurementsByCustomer(req: Request, res: Response) {}
}

export default MeasurementController;
