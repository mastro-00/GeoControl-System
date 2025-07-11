import { Sensor as SensorDTO } from "@dto/Sensor";
import { SensorRepository } from "@repositories/SensorRepository";
import { mapSensorDAOToDTO } from "@services/mapperService";

export async function getSensorsByGateway(networkCode: string, gatewayMac: string): Promise<SensorDTO[]> {
    const sensorRepo = new SensorRepository();
    return (await sensorRepo.getSensorsByGateway(networkCode, gatewayMac)).map(mapSensorDAOToDTO);
}

export async function createSensor(networkCode: string, gatewayMac: string, sensorDto: SensorDTO): Promise<void> {
    const sensorRepo = new SensorRepository();
    await sensorRepo.createSensor(networkCode, gatewayMac, sensorDto.macAddress, sensorDto.name, sensorDto.description, sensorDto.variable, sensorDto.unit);
}

export async function getSensorByMac(networkCode: string, gatewayMac: string, sensorMac: string): Promise<SensorDTO> {
    const sensorRepo = new SensorRepository();
    return mapSensorDAOToDTO(await sensorRepo.getSensorByMac(networkCode, gatewayMac, sensorMac));
}

export async function updateSensor(networkCode: string, gatewayMac: string, sensorMac: string, sensorDto: SensorDTO): Promise<void> {
    const sensorRepo = new SensorRepository();
    await sensorRepo.updateSensor(networkCode, gatewayMac, sensorMac, sensorDto.macAddress, sensorDto.name, sensorDto.description, sensorDto.variable, sensorDto.unit);
}

export async function deleteSensor(networkCode: string, gatewayMac: string, sensorMac: string): Promise<void> {
    const sensorRepo = new SensorRepository();
    await sensorRepo.deleteSensor(networkCode, gatewayMac, sensorMac);
}