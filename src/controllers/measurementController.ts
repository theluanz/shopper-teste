import { Request, Response } from 'express';
import Measurement from '../models/measurement';
import Customer from '../models/customer';
import { Op } from 'sequelize';
import { isValid, parseISO, startOfMonth, endOfMonth } from 'date-fns';

import { GeminiApi } from '../services/GeminiApi';
import { saveImage } from '../services/SaveImage';
const geminiAPI = new GeminiApi();

class MeasurementController {
  static async createMeasurement(req: Request, res: Response) {
    const { image, customer_code, measure_datetime, measure_type } = req.body;
    if (!image || !customer_code || !measure_datetime || !measure_type) {
      return res.status(400).json({
        error_code: 'INVALID_DATA',
        error_description: 'Missing required fields',
      });
    }
    const validMeasureTypes = ['WATER', 'GAS'];
    if (!validMeasureTypes.includes(measure_type)) {
      return res.status(400).json({
        error_code: 'INVALID_DATA',
        error_description: 'Invalid measure_type value',
      });
    }

    let imageBuffer;
    try {
      imageBuffer = Buffer.from(image, 'base64');
    } catch (err) {
      return res.status(400).json({
        error_code: 'INVALID_DATA',
        error_description: 'Invalid base64 image data',
      });
    }

    let date;
    try {
      date = parseISO(measure_datetime);
      if (!isValid(date)) {
        throw new Error('Invalid date');
      }
    } catch (err) {
      return res.status(400).json({
        error_code: 'INVALID_DATA',
        error_description: 'Invalid datetime format',
      });
    }

    const customer = await Customer.findOne({ where: { customer_code } });
    if (!customer) {
      return res.status(404).json({
        error_code: 'INVALID_DATA',
        error_description: 'Customer not found',
      });
    }

    const startOfMonthDate = startOfMonth(date);
    const endOfMonthDate = endOfMonth(date);

    const measureAlreadyExists = await Measurement.findOne({
      where: {
        measure_type,
        customer_code,
        measure_datetime: {
          [Op.between]: [startOfMonthDate, endOfMonthDate],
        },
      },
    });

    if (measureAlreadyExists) {
      return res.status(400).json({
        error_code: 'DOUBLE_REPORT',
        error_description: 'Leitura do mês já realizada',
      });
    }

    const image_path = await saveImage(imageBuffer);
    const { image_url, measure_value } = await geminiAPI.extractValueFromImage(image_path);

    if (measure_value === -1) {
      return res.status(400).json({
        error_code: 'INVALID_DATA',
        error_description: 'Não foi possível ler está imagem',
      });
    }

    const measurement = await Measurement.create({
      measure_value: measure_value,
      measure_datetime: date,
      measure_type,
      image_url: image_url,
      confirmed: 0,
    });
    await measurement.$set('customers', [customer.customer_code]);

    res.status(201).json({
      image_url,
      measure_value,
      measure_uuid: measurement.measure_uuid,
    });
  }
  static async confirmMeasure(req: Request, res: Response) {}
  static async getMeasurementsByCustomer(req: Request, res: Response) {}
}

export default MeasurementController;
