import { Request, Response } from 'express';
import Measurement from '../models/measurement';
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
      has_confirmed: false,
    });

    res.status(201).json({
      image_url,
      measure_value,
      measure_uuid: measurement.measure_uuid,
    });
  }

  static async confirmMeasure(req: Request, res: Response) {
    try {
      const { measure_uuid, confirmed_value } = req.body;

      if (typeof measure_uuid !== 'string' || typeof confirmed_value !== 'number') {
        return res.status(400).json({
          error_code: 'INVALID_DATA',
          error_description: 'Tipo de dado inválido para measure_uuid ou confirmed_value',
        });
      }

      const measurement = await Measurement.findOne({ where: { measure_uuid } });

      if (!measurement) {
        return res.status(404).json({
          error_code: 'MEASURE_NOT_FOUND',
          error_description: 'Medição não encontrada',
        });
      }

      if (measurement.has_confirmed) {
        return res.status(409).json({
          error_code: 'CONFIRMATION_DUPLICATE',
          error_description: 'Leitura do mês já realizada',
        });
      }

      measurement.measure_value = confirmed_value;
      measurement.has_confirmed = true;
      await measurement.save();

      return res.status(200).json({
        sucess: true,
      });
    } catch (error) {
      console.error('Error confirming measurement:', error);
      return res.status(500).json({
        error_code: 'INTERNAL_SERVER_ERROR',
        error_description: 'Erro interno no servidor',
      });
    }
  }

  static async getMeasurementsByCustomer(req: Request, res: Response) {
    try {
      const customerCode = req.params.customerCode;
      const { measure_type } = req.query;

      const filterConditions: any = {
        customer_code: customerCode,
      };

      if (measure_type) {
        const validMeasureType = (measure_type as string).toUpperCase();
        if (['WATER', 'GAS'].includes(validMeasureType)) {
          filterConditions.measure_type = validMeasureType;
        } else {
          return res.status(400).json({
            error_code: 'INVALID_TYPE',
            error_description: 'Tipo de medição não permitida',
          });
        }
      }

      const measurements = await Measurement.findAll({
        where: filterConditions,
        order: [['measure_datetime', 'DESC']],
        attributes: [
          'measure_uuid',
          'measure_datetime',
          'measure_type',
          'has_confirmed',
          'image_url',
        ],
      });

      if (!measurements || measurements.length === 0) {
        return res.status(404).json({
          error_code: 'MEASURES_NOT_FOUND',
          error_description: 'Nenhuma leitura encontrada',
        });
      }

      return res.status(200).json({
        customer_code: customerCode,
        measures: measurements,
      });
    } catch (error) {
      console.error('Error fetching measurements:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
}

export default MeasurementController;
