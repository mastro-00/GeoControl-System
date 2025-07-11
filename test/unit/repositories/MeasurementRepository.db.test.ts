import { initializeTestDataSource, closeTestDataSource, TestDataSource } from "@test/setup/test-datasource";
import { MeasurementRepository } from "@repositories/MeasurementRepository";
import { NetworkRepository } from "@repositories/NetworkRepository";
import { GatewayRepository } from "@repositories/GatewayRepository";
import { SensorRepository } from "@repositories/SensorRepository";
import { NotFoundError } from "@models/errors/NotFoundError";
import { MeasurementDAO } from "@dao/MeasurementDAO";
import { GatewayDAO } from "@models/dao/GatewayDAO";
import { NetworkDAO } from "@models/dao/NetworkDAO";
import { SensorDAO } from "@models/dao/SensorDAO";

beforeAll(async () => {
  await initializeTestDataSource();
});

afterAll(async () => {
  await closeTestDataSource();
});

beforeEach(async () => {
  await TestDataSource.getRepository(MeasurementDAO).clear();
  await TestDataSource.getRepository(SensorDAO).clear();
  await TestDataSource.getRepository(GatewayDAO).clear();
  await TestDataSource.getRepository(NetworkDAO).clear();
});

describe("MeasurementRepository: SQLite in-memory", () => {
  const networkCode = "TEST_NET";
  const gatewayMac = "94:3F:BE:4C:4A:79";
  const sensorMac = "84:3F:BD:4C:3A:79";
  const sensorMac2 = "AA:BB:CC:DD:EE:FF";
  const sensorName = "Test Sensor";
  const sensorDescription = "Test Description";
  const sensorVariable = "temperature";
  const sensorUnit = "°C";

  let repo: MeasurementRepository;
  let networkRepo: NetworkRepository;
  let gatewayRepo: GatewayRepository;
  let sensorRepo: SensorRepository;

  beforeEach(async () => {
    repo = new MeasurementRepository();
    networkRepo = new NetworkRepository();
    gatewayRepo = new GatewayRepository();
    sensorRepo = new SensorRepository();

    await networkRepo.createNetwork(networkCode, "Test Network", "Network Description");
    await gatewayRepo.createGateway(networkCode, gatewayMac, "Test Gateway", "Gateway Description");
    await sensorRepo.createSensor(
      networkCode,
      gatewayMac,
      sensorMac,
      sensorName,
      sensorDescription,
      sensorVariable,
      sensorUnit
    );
    await sensorRepo.createSensor(
      networkCode,
      gatewayMac,
      sensorMac2,
      "Sensor 2",
      "Description 2",
      "humidity",
      "%"
    );
  });

  it("create measurement", async () => {
    const testDate = new Date();
    const testValue = 25.5;

    await repo.createMeasurement(
      networkCode,
      gatewayMac,
      sensorMac,
      testDate,
      testValue
    );

    const result = await repo.getAllMeasurementsBySensor(
      networkCode,
      gatewayMac,
      sensorMac,
      null,
      null
    );

    expect(result.measurements.length).toBe(1);
    expect(result.measurements[0].value).toBe(testValue);
    expect(new Date(result.measurements[0].createdAt)).toEqual(testDate);
  });

  it("get all measurements by sensor with date range", async () => {
    const dates = [
      new Date(2023, 0, 1), 
      new Date(2023, 5, 15),
      new Date(2023, 11, 31) 
    ];
    const values = [10, 20, 30];

    for (let i = 0; i < dates.length; i++) {
      await repo.createMeasurement(
        networkCode,
        gatewayMac,
        sensorMac,
        dates[i],
        values[i]
      );
    }

    const startDate = new Date(2023, 3, 1); 
    const endDate = new Date(2023, 8, 1); 

    const result = await repo.getAllMeasurementsBySensor(
      networkCode,
      gatewayMac,
      sensorMac,
      startDate,
      endDate
    );

    expect(result.measurements.length).toBe(1);
    expect(result.measurements[0].value).toBe(20); 
    expect(result.stats.mean).toBe(20);
    expect(result.stats.variance).toBe(0); 
  });

  it("get all measurements by network with sensor filter", async () => {
    await repo.createMeasurement(networkCode, gatewayMac, sensorMac, new Date(), 10);
    await repo.createMeasurement(networkCode, gatewayMac, sensorMac, new Date(), 20);
    await repo.createMeasurement(networkCode, gatewayMac, sensorMac2, new Date(), 30);

    const results = await repo.getAllMeasurementsByNetwork(
      networkCode,
      [sensorMac], 
      null,
      null
    );

    expect(results.length).toBe(1);
    expect(results[0].sensorMacAddress).toBe(sensorMac);
    expect(results[0].measurements.length).toBe(2);
  });

  it("get all measurements by network without sensor filter", async () => {
    await repo.createMeasurement(networkCode, gatewayMac, sensorMac, new Date(), 10);
    await repo.createMeasurement(networkCode, gatewayMac, sensorMac2, new Date(), 20);

    const results = await repo.getAllMeasurementsByNetwork(
      networkCode,
      [], 
      null,
      null
    );

    expect(results.length).toBe(2);
    expect(results.find(r => r.sensorMacAddress === sensorMac)).toBeDefined();
    expect(results.find(r => r.sensorMacAddress === sensorMac2)).toBeDefined();
  });

  it("calculate correct statistics", async () => {
    const values = [10, 20, 30, 40];
    for (const value of values) {
      await repo.createMeasurement(
        networkCode,
        gatewayMac,
        sensorMac,
        new Date(),
        value
      );
    }

    const result = await repo.getAllMeasurementsBySensor(
      networkCode,
      gatewayMac,
      sensorMac,
      null,
      null
    );

    const expectedMean = 25;
    const expectedVariance = 125; 
    const expectedStdDev = Math.sqrt(expectedVariance);

    expect(result.stats.mean).toBe(expectedMean);
    expect(result.stats.variance).toBe(expectedVariance);
    expect(result.stats.upperThreshold).toBe(expectedMean + 2 * expectedStdDev);
    expect(result.stats.lowerThreshold).toBe(expectedMean - 2 * expectedStdDev);

    const outliers = result.measurements.filter(m => m.isOutlier);
    expect(outliers.length).toBe(0); 
  });

  it("detect outliers correctly", async () => {
    const values = [10, 11, 12, 13, 14, 100]; 
    for (const value of values) {
      await repo.createMeasurement(
        networkCode,
        gatewayMac,
        sensorMac,
        new Date(),
        value
      );
    }

    const result = await repo.getAllMeasurementsBySensor(
      networkCode,
      gatewayMac,
      sensorMac,
      null,
      null
    );

    const outliers = result.measurements.filter(m => m.isOutlier);
    expect(outliers.length).toBe(1);
    expect(outliers[0].value).toBe(100);
  });

  it("throw NotFoundError for non-existent sensor", async () => {
    await expect(
      repo.createMeasurement(
        networkCode,
        gatewayMac,
        "non:existent:mac",
        new Date(),
        10
      )
    ).rejects.toThrow(NotFoundError);
  });

  it("silently skip non-existent sensors in getAllMeasurementsByNetwork", async () => {
    await repo.createMeasurement(networkCode, gatewayMac, sensorMac, new Date(), 10);

    const results = await repo.getAllMeasurementsByNetwork(
      networkCode,
      [sensorMac, "non:existent:mac"],
      null,
      null
    );

    expect(results.length).toBe(1);
    expect(results[0].sensorMacAddress).toBe(sensorMac);
  });
});