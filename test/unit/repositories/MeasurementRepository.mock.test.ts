import { MeasurementRepository } from "@repositories/MeasurementRepository";
import { MeasurementDAO } from "@dao/MeasurementDAO";
import { NotFoundError } from "@models/errors/NotFoundError";

const mockMeasurement = new MeasurementDAO();
mockMeasurement.value = 25.5;
mockMeasurement.createdAt = new Date();

const mockSensor = {
  macAddress: "84:3F:BD:4C:3A:79",
  measurements: [mockMeasurement]
};

const mockGateway = {
  macAddress: "94:3F:BE:4C:4A:79",
  sensors: [mockSensor]
};

const mockCreate = jest.fn();
const mockSave = jest.fn();
const mockFind = jest.fn();

const mockSensorRepo = {
  getSensorByMac: jest.fn(),
  getSensorsByGateway: jest.fn()
};

const mockGatewayRepo = {
  getGatewaysByNetwork: jest.fn()
};

jest.mock("@repositories/SensorRepository", () => ({
  SensorRepository: jest.fn(() => mockSensorRepo)
}));

jest.mock("@repositories/GatewayRepository", () => ({
  GatewayRepository: jest.fn(() => mockGatewayRepo)
}));

jest.mock("@database", () => ({
  AppDataSource: {
    getRepository: jest.fn(() => ({
      create: mockCreate,
      save: mockSave,
      find: mockFind
    }))
  }
}));

describe("MeasurementRepository: mocked database", () => {
  let repo: MeasurementRepository;
  const networkCode = "TEST_NET";
  const gatewayMac = "94:3F:BE:4C:4A:79";
  const sensorMac = "84:3F:BD:4C:3A:79";
  const testDate = new Date();
  const testValue = 25.5;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockCreate.mockImplementation((data) => data);
    mockSave.mockImplementation((data) => Promise.resolve(data));
    mockFind.mockResolvedValue([mockMeasurement]);
    
    mockSensorRepo.getSensorByMac.mockImplementation((n, g, s) => {
      if (s === sensorMac) return Promise.resolve(mockSensor);
      throw new NotFoundError(`Sensor not found`);
    });
    
    mockSensorRepo.getSensorsByGateway.mockResolvedValue([mockSensor]);
    mockGatewayRepo.getGatewaysByNetwork.mockResolvedValue([mockGateway]);
    
    repo = new MeasurementRepository();
  });

  it("create measurement", async () => {
    await repo.createMeasurement(networkCode, gatewayMac, sensorMac, testDate, testValue);
    
    expect(mockCreate).toHaveBeenCalledWith({
      createdAt: testDate,
      value: testValue,
      sensor: mockSensor
    });
    expect(mockSave).toHaveBeenCalled();
  });

  it("create measurement: sensor not found", async () => {
    await expect(
      repo.createMeasurement(networkCode, gatewayMac, "non-existent", testDate, testValue)
    ).rejects.toThrow(NotFoundError);
  });

  it("get measurements by sensor", async () => {
    const result = await repo.getAllMeasurementsBySensor(
      networkCode, gatewayMac, sensorMac, null, null
    );

    expect(result.sensorMacAddress).toBe(sensorMac);
    expect(result.measurements.length).toBe(1);
    expect(result.measurements[0].value).toBe(testValue);
  });

  it("get measurements by network", async () => {
    const results = await repo.getAllMeasurementsByNetwork(
      networkCode, [sensorMac], null, null
    );

    expect(results.length).toBe(1);
    expect(results[0].sensorMacAddress).toBe(sensorMac);
    expect(results[0].measurements.length).toBe(1);
  });
});