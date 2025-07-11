import { AppDataSource } from "@database";
import { Repository } from "typeorm";
import { MeasurementDAO } from "@dao/MeasurementDAO";
import { SensorRepository } from "./SensorRepository";
import { GatewayRepository } from "./GatewayRepository";
import { Measurements as MeasurementsDTO } from "@dto/Measurements";
import { Stats } from "@dto/Stats";
import { NotFoundError } from "@models/errors/NotFoundError";

export class MeasurementRepository {
    private measurementRepo: Repository<MeasurementDAO>;
    private sensorRepo: SensorRepository;
    private gatewayRepo: GatewayRepository;

    constructor() {
        this.measurementRepo = AppDataSource.getRepository(MeasurementDAO);
        this.sensorRepo = new SensorRepository();
        this.gatewayRepo = new GatewayRepository();
    }

    async createMeasurement(networkCode: string, gatewayMac: string, sensorMac: string, createdAt: Date, value: number): Promise<void> {
        const sensor = await this.sensorRepo.getSensorByMac(networkCode, gatewayMac, sensorMac);
        const measurement = this.measurementRepo.create({
            createdAt: createdAt,
            value: value,
            sensor: sensor
        });
        await this.measurementRepo.save(measurement);
    }

    async getAllMeasurementsByNetwork(networkCode: string, sensorMacs: string[], startDate: Date, endDate: Date): Promise<MeasurementsDTO[]> {
        const gateways = await this.gatewayRepo.getGatewaysByNetwork(networkCode);

        const measurements: MeasurementsDTO[] = [];

        for (const gateway of gateways) {
            const sensors = await this.sensorRepo.getSensorsByGateway(networkCode, gateway.macAddress);
            const filteredSensors = sensorMacs?.length > 0 ? sensors.filter(s => sensorMacs.includes(s.macAddress)) : sensors;

            for (const sensor of filteredSensors) {
                try {
                    const result = await this.getAllMeasurementsBySensor(networkCode, gateway.macAddress, sensor.macAddress, startDate, endDate);
                    measurements.push(result);
                } catch (err) {
                    if (err instanceof NotFoundError) {
                        continue; // Invalid sensor, silently skip
                    }
                    throw err; // Unexpected error
                }
            }
        }

        return measurements;
    }

    async getAllMeasurementsBySensor(networkCode: string, gatewayMac: string, sensorMac: string, startDate: Date, endDate: Date): Promise<MeasurementsDTO> {
        const sensor = await this.sensorRepo.getSensorByMac(networkCode, gatewayMac, sensorMac);

        const measurements = sensor.measurements.filter(measurement => {
            const measurementDate = new Date(measurement.createdAt);
            if (startDate && endDate) {
                return measurementDate >= startDate && measurementDate <= endDate;
            } else if (startDate) {
                return measurementDate >= startDate;
            } else if (endDate) {
                return measurementDate <= endDate;
            } else {
                return true; // No date filter applied, return all measurements
            }
        });

        const mean = measurements.length > 0
            ? measurements.reduce((acc, measurement) => acc + measurement.value, 0) / measurements.length
            : 0;
        const variance = measurements.length > 0
            ? measurements.reduce((acc, measurement) => acc + Math.pow(measurement.value - mean, 2), 0) / measurements.length
            : 0;
        const stdDev = Math.sqrt(variance);

        const stats: Stats = {
            startDate: startDate,
            endDate: endDate,
            mean: mean,
            variance: variance,
            upperThreshold: mean + 2 * stdDev,
            lowerThreshold: mean - 2 * stdDev
        };

        for (const measurement of measurements) {
            measurement.isOutlier = measurement.value > stats.upperThreshold || measurement.value < stats.lowerThreshold;
        }

        const measurementsDTO: MeasurementsDTO = {
            sensorMacAddress: sensorMac,
            stats: stats,
            measurements: measurements
        }

        return measurementsDTO;
    }
}