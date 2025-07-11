import { CONFIG } from "@config";
import { Router } from "express";
import { authenticateUser } from "@middlewares/authMiddleware";
import { UserType } from "@models/UserType";
import {
  createMeasurement,
  getAllMeasurementsByNetwork,
  getStatsByNetwork,
  getOutliersByNetwork,
  getAllMeasurementsBySensor,
  getStatsBySensor,
  getOutliersBySensor

} from "@controllers/measurementController";
import { Measurement, MeasurementFromJSON } from "@dto/Measurement";

const router = Router();

function parseDate(dateStr: unknown): Date | undefined {
  if (typeof dateStr === 'string') {
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) return parsed;
  }
  return undefined;
}

function parseSensorMacs(query: any): string[] {
  if (Array.isArray(query.sensorMacs)) {
    return query.sensorMacs.flatMap(m => typeof m === 'string' ? m.split(',') : []);
  }
  return [];
}

// Retrieve measurements for a set of sensors of a specific network
router.get(
  CONFIG.ROUTES.V1_NETWORKS + "/:networkCode/measurements",
  authenticateUser([UserType.Admin, UserType.Operator, UserType.Viewer]),
  async (req, res, next) => {
    try {
      const startDate = parseDate(req.query.startDate);
      const endDate = parseDate(req.query.endDate);
      const sensorMacs = parseSensorMacs(req.query);
      
      res.status(200).json(await getAllMeasurementsByNetwork(req.params.networkCode, sensorMacs, startDate, endDate));
    } catch (error) {
      next(error);
    }
  }
);

// Retrieve statistics for a set of sensors of a specific network
router.get(
  CONFIG.ROUTES.V1_NETWORKS + "/:networkCode/stats",
  authenticateUser([UserType.Admin, UserType.Operator, UserType.Viewer]),
  async (req, res, next) => {
    try {
      const startDate = parseDate(req.query.startDate);
      const endDate = parseDate(req.query.endDate);
      const sensorMacs = parseSensorMacs(req.query);

      res.status(200).json(await getStatsByNetwork(req.params.networkCode, sensorMacs, startDate, endDate));
    } catch (error) {
      next(error);
    }
  }
);

// Retrieve only outliers for a set of sensors of a specific network
router.get(
  CONFIG.ROUTES.V1_NETWORKS + "/:networkCode/outliers",
  authenticateUser([UserType.Admin, UserType.Operator, UserType.Viewer]),
  async (req, res, next) => {
    try {
      const startDate = parseDate(req.query.startDate);
      const endDate = parseDate(req.query.endDate);
      const sensorMacs = parseSensorMacs(req.query);

      res.status(200).json(await getOutliersByNetwork(req.params.networkCode, sensorMacs, startDate, endDate));
    } catch (error) {
      next(error);
    }
  }
);

// Store a measurement for a sensor (Admin & Operator)
router.post(
  CONFIG.ROUTES.V1_SENSORS + "/:sensorMac/measurements",
  authenticateUser([UserType.Admin, UserType.Operator]),
  async (req, res, next) => {
    try {
      const measures: Measurement[] = req.body;
      for (const m of measures) {
        await createMeasurement(req.params.networkCode, req.params.gatewayMac, req.params.sensorMac, MeasurementFromJSON(m));
      }
      res.status(201).send();
    } catch (error) {
      next(error);
    }
  }
);

// Retrieve measurements for a specific sensor
router.get(
  CONFIG.ROUTES.V1_SENSORS + "/:sensorMac/measurements",
  authenticateUser([UserType.Admin, UserType.Operator, UserType.Viewer]),
  async (req, res, next) => {
    try {
      const startDate = parseDate(req.query.startDate);
      const endDate = parseDate(req.query.endDate);

      const measurements = await getAllMeasurementsBySensor(req.params.networkCode, req.params.gatewayMac, req.params.sensorMac, startDate, endDate);
      res.status(200).json(measurements);

    } catch (error) {
      next(error);
    }
  }
);

// Retrieve statistics for a specific sensor
router.get(CONFIG.ROUTES.V1_SENSORS + "/:sensorMac/stats",
  authenticateUser([UserType.Admin, UserType.Operator, UserType.Viewer]),
  async (req, res, next) => {
    try {
      const startDate = parseDate(req.query.startDate);
      const endDate = parseDate(req.query.endDate);

      res.status(200).json(await getStatsBySensor(req.params.networkCode, req.params.gatewayMac, req.params.sensorMac, startDate, endDate));
    } catch (error) {
      next(error);
    }
  }
);

// Retrieve only outliers for a specific sensor
router.get(
  CONFIG.ROUTES.V1_SENSORS + "/:sensorMac/outliers",
  authenticateUser([UserType.Admin, UserType.Operator, UserType.Viewer]),
  async (req, res, next) => {
    try {
      const startDate = parseDate(req.query.startDate);
      const endDate = parseDate(req.query.endDate);

      res.status(200).json(await getOutliersBySensor(req.params.networkCode, req.params.gatewayMac, req.params.sensorMac, startDate, endDate));
    } catch (error) {
      next(error);
    }
  }
);

export default router;
