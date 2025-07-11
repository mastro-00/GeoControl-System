import { initializeTestDataSource, closeTestDataSource, TestDataSource } from "@test/setup/test-datasource";
import { SensorRepository } from "@repositories/SensorRepository";
import { NetworkRepository } from "@repositories/NetworkRepository";
import { GatewayRepository } from "@repositories/GatewayRepository";
import { NotFoundError } from "@models/errors/NotFoundError";
import { ConflictError } from "@models/errors/ConflictError";
import { MeasurementDAO } from "@dao/MeasurementDAO";
import { SensorDAO } from "@models/dao/SensorDAO";
import { GatewayDAO } from "@models/dao/GatewayDAO";
import { NetworkDAO } from "@models/dao/NetworkDAO";


beforeAll(async () => {
  await initializeTestDataSource();
});

afterAll(async () => {
  await closeTestDataSource();
});

beforeEach(async () => {
  // Clear all related repositories
  await TestDataSource.getRepository(MeasurementDAO).clear();
  await TestDataSource.getRepository(SensorDAO).clear();
  await TestDataSource.getRepository(GatewayDAO).clear();
  await TestDataSource.getRepository(NetworkDAO).clear();
});

describe("SensorRepository: SQLite in-memory", () => {
  const networkCode = "TEST_NET";
  const gatewayMac = "94:3F:BE:4C:4A:79";
  const sensorMac = "84:3F:BD:4C:3A:79";
  const sensorName = "Test Sensor";
  const sensorDescription = "Test Description";
  const sensorVariable = "temperature";
  const sensorUnit = "°C";
  const updatedMac = "FF:FF:FF:FF:FF:FF";
  const updatedName = "Updated Sensor";
  const updatedDescription = "Updated Description";
  const updatedVariable = "humidity";
  const updatedUnit = "%";

  let repo: SensorRepository;
  let networkRepo: NetworkRepository;
  let gatewayRepo: GatewayRepository;

  beforeEach(async () => {
    repo = new SensorRepository();
    networkRepo = new NetworkRepository();
    gatewayRepo = new GatewayRepository();

    // Setup test network and gateway
    await networkRepo.createNetwork(networkCode, "Test Network", "Network Description");
    await gatewayRepo.createGateway(networkCode, gatewayMac, "Test Gateway", "Gateway Description");
  });

  it("create sensor", async () => {
    const sensor = await repo.createSensor(
      networkCode,
      gatewayMac,
      sensorMac,
      sensorName,
      sensorDescription,
      sensorVariable,
      sensorUnit
    );

    expect(sensor).toMatchObject({
      macAddress: sensorMac,
      name: sensorName,
      description: sensorDescription,
      variable: sensorVariable,
      unit: sensorUnit
    });

    const found = await repo.getSensorByMac(networkCode, gatewayMac, sensorMac);
    expect(found.macAddress).toBe(sensorMac);
  });

  it("get sensors by gateway", async () => {
    await repo.createSensor(networkCode, gatewayMac, "AA:BB:CC:DD:EE:FF", "Sensor 1", "Desc 1", "temp", "°C");
    await repo.createSensor(networkCode, gatewayMac, "11:22:33:44:55:66", "Sensor 2", "Desc 2", "humidity", "%");

    const sensors = await repo.getSensorsByGateway(networkCode, gatewayMac);
    expect(sensors.length).toBe(2);
    expect(sensors[0].macAddress).toBe("11:22:33:44:55:66");
    expect(sensors[1].macAddress).toBe("AA:BB:CC:DD:EE:FF");
  });

  it("find sensor by mac: not found", async () => {
    await expect(repo.getSensorByMac(networkCode, gatewayMac, "non:existent:mac"))
      .rejects.toThrow(NotFoundError);
  });

  it("create sensor: conflict", async () => {
    await repo.createSensor(
      networkCode,
      gatewayMac,
      sensorMac,
      sensorName,
      sensorDescription,
      sensorVariable,
      sensorUnit
    );

    await expect(
      repo.createSensor(
        networkCode,
        gatewayMac,
        sensorMac,
        "Different Name",
        "Different Desc",
        "humidity",
        "%"
      )
    ).rejects.toThrow(ConflictError);
  });

  it("update sensor without changing mac", async () => {
    await repo.createSensor(
      networkCode,
      gatewayMac,
      sensorMac,
      sensorName,
      sensorDescription,
      sensorVariable,
      sensorUnit
    );

    await repo.updateSensor(
      networkCode,
      gatewayMac,
      sensorMac, 
      sensorMac, 
      updatedName,
      updatedDescription,
      updatedVariable,
      updatedUnit
    );

    const updatedSensor = await repo.getSensorByMac(networkCode, gatewayMac, sensorMac);
    expect(updatedSensor).toMatchObject({
      macAddress: sensorMac,
      name: updatedName,
      description: updatedDescription,
      variable: updatedVariable,
      unit: updatedUnit
    });
  });

  it("update sensor with new mac", async () => {
    const originalSensor = await repo.createSensor(
      networkCode,
      gatewayMac,
      sensorMac,
      sensorName,
      sensorDescription,
      sensorVariable,
      sensorUnit
    );

    await TestDataSource.getRepository(MeasurementDAO).save([
      { sensor: originalSensor, value: 25.5, createdAt: new Date(), isOutlier: false },
      { sensor: originalSensor, value: 30.2, createdAt: new Date(), isOutlier: true }
    ]);

    await repo.updateSensor(
      networkCode,
      gatewayMac,
      sensorMac, 
      updatedMac, 
      updatedName,
      updatedDescription,
      updatedVariable,
      updatedUnit
    );

    await expect(repo.getSensorByMac(networkCode, gatewayMac, sensorMac))
      .rejects.toThrow(NotFoundError);

    const updatedSensor = await repo.getSensorByMac(networkCode, gatewayMac, updatedMac);
    expect(updatedSensor.name).toBe(updatedName);
    expect(updatedSensor.description).toBe(updatedDescription);
    expect(updatedSensor.variable).toBe(updatedVariable);
    expect(updatedSensor.unit).toBe(updatedUnit);

    expect(updatedSensor.measurements.length).toBe(2);
    expect(updatedSensor.measurements[0].value).toBe(25.5);
    expect(updatedSensor.measurements[1].value).toBe(30.2);
  });

  it("delete sensor", async () => {
    const sensor = await repo.createSensor(
      networkCode,
      gatewayMac,
      sensorMac,
      sensorName,
      sensorDescription,
      sensorVariable,
      sensorUnit
    );

    await repo.deleteSensor(networkCode, gatewayMac, sensorMac);
    
    await expect(repo.getSensorByMac(networkCode, gatewayMac, sensorMac))
      .rejects.toThrow(NotFoundError);
  });

  it("delete sensor with measurements - should cascade", async () => {
    const sensor = await repo.createSensor(
      networkCode,
      gatewayMac,
      sensorMac,
      sensorName,
      sensorDescription,
      sensorVariable,
      sensorUnit
    );
    await TestDataSource.getRepository(MeasurementDAO).save([
      { sensor, value: 25.5, createdAt: new Date(), isOutlier: false },
      { sensor, value: 30.2, createdAt: new Date(), isOutlier: true }
    ]);

    const measurementsBefore = await TestDataSource.getRepository(MeasurementDAO).find();
    expect(measurementsBefore.length).toBe(2);

    await repo.deleteSensor(networkCode, gatewayMac, sensorMac);

    const measurementsAfter = await TestDataSource.getRepository(MeasurementDAO).find();
    expect(measurementsAfter.length).toBe(0);
  });
});