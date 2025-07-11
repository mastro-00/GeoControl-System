import { AppDataSource } from "@database";
import { Repository } from "typeorm";
import { SensorDAO } from "@dao/SensorDAO";
import { GatewayRepository } from "./GatewayRepository";
import { throwConflictIfFound } from "@utils";
import { NotFoundError } from "@models/errors/NotFoundError";
import { MeasurementDAO } from "@models/dao/MeasurementDAO";

export class SensorRepository {
    private gatewayRepo: GatewayRepository;
    private sensorRepo: Repository<SensorDAO>;
    private measurementRepo: Repository<MeasurementDAO>;

    constructor() {
        this.gatewayRepo = new GatewayRepository();
        this.sensorRepo = AppDataSource.getRepository(SensorDAO);
        this.measurementRepo = AppDataSource.getRepository(MeasurementDAO);
    }

    async getSensorsByGateway(networkCode: string, gatewayMac: string): Promise<SensorDAO[]> {
        const gateway = await this.gatewayRepo.getGatewayByMac(networkCode, gatewayMac);
        return gateway.sensors;
    }

    async createSensor( networkCode: string, gatewayMac: string, macAddress: string, name: string, description: string, variable: string, unit: string ): Promise<SensorDAO> {
        throwConflictIfFound(
            await this.sensorRepo.find({ where: { macAddress } }),
            () => true,
            `Sensor with mac '${macAddress}' already exists`
        );

        const gateway = await this.gatewayRepo.getGatewayByMac(networkCode, gatewayMac);

        return this.sensorRepo.save({
            macAddress,
            name,
            description,
            variable,
            unit,
            gateway,
            measurements: []
        });
    }

    async getSensorByMac(networkCode: string, gatewayMac: string, sensorMac: string): Promise<SensorDAO> {
        const sensors = await this.getSensorsByGateway(networkCode, gatewayMac);

        const sensor = sensors.find(sensor => sensor.macAddress === sensorMac);
        if (!sensor) throw new NotFoundError(`Sensor with mac '${sensorMac}' not found in gateway '${gatewayMac}'`);
        
        return sensor;
    }

    async updateSensor(networkCode: string, gatewayMac: string, oldMacAddress: string, newMacAddress?: string, newName?: string, newDescription?: string, newVariable?: string, newUnit?: string ): Promise<void> {
        // 1. Check if the old sensor exists and belongs to the right gateway and network
        const oldSensor = await this.getSensorByMac(networkCode, gatewayMac, oldMacAddress);
        
        // 2. If macAddress is the same or not provided, update properties directly
        if (!newMacAddress || oldMacAddress === newMacAddress) {
            if (newName !== undefined) oldSensor.name = newName;
            if (newDescription !== undefined) oldSensor.description = newDescription;
            if (newVariable !== undefined) oldSensor.variable = newVariable;
            if (newUnit !== undefined) oldSensor.unit = newUnit;
            await this.sensorRepo.save(oldSensor);
            return;
        }

        // 3. Create a new sensor with the new mac address
        const newSensor = await this.createSensor(networkCode, gatewayMac, newMacAddress, newName ?? oldSensor.name, newDescription ?? oldSensor.description, newVariable ?? oldSensor.variable, newUnit ?? oldSensor.unit);

        // 4. Transfer all measurements from old sensor to new sensor
        await this.measurementRepo.save(
            oldSensor.measurements.map(m => ({ ...m, sensor: newSensor }))
        );

        // 5. Remove the old sensor
        await this.sensorRepo.remove(oldSensor);
    }

    async deleteSensor(networkCode: string, gatewayMac: string, macAddress: string): Promise<void> {
        await this.sensorRepo.remove(await this.getSensorByMac(networkCode, gatewayMac, macAddress));
    }
}