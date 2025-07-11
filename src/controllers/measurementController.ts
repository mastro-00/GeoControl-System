import { Measurement as MeasurementDTO } from "@dto/Measurement";
import { Measurements as MeasurementsDTO } from "@dto/Measurements";
import { Stats } from "@models/dto/Stats";
import { MeasurementRepository } from "@repositories/MeasurementRepository";

export async function getAllMeasurementsByNetwork(networkCode: string, sensorMacs: string[], startDate: Date, endDate: Date): Promise<MeasurementsDTO[]> {
    const measurementRepo = new MeasurementRepository();
    return await measurementRepo.getAllMeasurementsByNetwork(networkCode, sensorMacs, startDate, endDate);;
}

export async function getStatsByNetwork(networkCode: string, sensorMacs: string[], startDate: Date, endDate: Date): Promise<MeasurementsDTO[]> {
    const measurementRepo = new MeasurementRepository();
    const measurements = await measurementRepo.getAllMeasurementsByNetwork(networkCode, sensorMacs, startDate, endDate);
    const stats = measurements.map(measurement => ({
        sensorMacAddress: measurement.sensorMacAddress,
        stats: measurement.stats
    }));
    return stats;
}

export async function getOutliersByNetwork(networkCode: string, sensorMacs: string[], startDate: Date, endDate: Date): Promise<MeasurementsDTO[]> {
    const measurementRepo = new MeasurementRepository();
    const measurements = await measurementRepo.getAllMeasurementsByNetwork(networkCode, sensorMacs, startDate, endDate);
    const filteredMeasurements = measurements.map((measurement) => {
        return {
            sensorMacAddress: measurement.sensorMacAddress,
            stats: measurement.stats,
            measurements: measurement.measurements.filter((m) => m.isOutlier === true)
        }
    });
    return filteredMeasurements;
}

export async function createMeasurement(networkCode: string, gatewayMac: string, sensorMac: string, measurementDto: MeasurementDTO): Promise<void> {
    const measurementRepo = new MeasurementRepository();
    await measurementRepo.createMeasurement(networkCode, gatewayMac, sensorMac, measurementDto.createdAt, measurementDto.value);
}

export async function getAllMeasurementsBySensor(networkCode: string, gatewayMac: string, sensorMac: string, startDate: Date, endDate: Date): Promise<MeasurementsDTO> {
    const measurementRepo = new MeasurementRepository();
    return await measurementRepo.getAllMeasurementsBySensor(networkCode, gatewayMac, sensorMac, startDate, endDate);;
}

export async function getStatsBySensor(networkCode: string, gatewayMac: string, sensorMac: string, startDate: Date, endDate: Date): Promise<Stats> {
    const measurementRepo = new MeasurementRepository();
    const measurements = await measurementRepo.getAllMeasurementsBySensor(networkCode, gatewayMac, sensorMac, startDate, endDate);
    return measurements.stats;
}

export async function getOutliersBySensor(networkCode: string, gatewayMac: string, sensorMac: string, startDate: Date, endDate: Date): Promise<MeasurementsDTO> {
    const measurementRepo = new MeasurementRepository();
    const measurements = await measurementRepo.getAllMeasurementsBySensor(networkCode, gatewayMac, sensorMac, startDate, endDate);
    const filteredMeasurements = measurements.measurements.filter((measurement) => measurement.isOutlier === true);
    return {
        sensorMacAddress: measurements.sensorMacAddress,
        stats: measurements.stats,
        measurements: filteredMeasurements
    };
}