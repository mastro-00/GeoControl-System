import { SensorRepository } from "@repositories/SensorRepository";
import { SensorDAO } from "@dao/SensorDAO";
import { ConflictError } from "@models/errors/ConflictError";
import { NotFoundError } from "@models/errors/NotFoundError";

const mockFind = jest.fn();
const mockSave = jest.fn();
const mockRemove = jest.fn();

const mockSensor = new SensorDAO();
mockSensor.macAddress = "84:3F:BD:4C:3A:79";
mockSensor.name = "Test Sensor";

const mockGateway = {
  macAddress: "94:3F:BE:4C:4A:79",
  sensors: [mockSensor]
};

jest.mock("@repositories/GatewayRepository", () => {
  return {
    GatewayRepository: jest.fn().mockImplementation(() => ({
      getGatewayByMac: jest.fn().mockImplementation((networkCode: string, macAddress: string) => {
        if (macAddress === mockGateway.macAddress) {
          return Promise.resolve(mockGateway);
        }
        return Promise.resolve({ macAddress, sensors: [] });
      })
    }))
  };
});

jest.mock("@database", () => ({
  AppDataSource: {
    getRepository: () => ({
      find: mockFind,
      save: mockSave,
      remove: mockRemove
    })
  }
}));

describe("SensorRepository: mocked database", () => {
  let repo: SensorRepository;
  const networkCode = "TEST_NET";
  const gatewayMac = "94:3F:BE:4C:4A:79";
  const sensorMac = "84:3F:BD:4C:3A:79";
  const nonExistentMac = "00:00:00:00:00:00";

  beforeEach(() => {
    jest.clearAllMocks();
    repo = new SensorRepository();
  });

  it("create sensor", async () => {
    mockFind.mockResolvedValue([]);
    mockSave.mockResolvedValue(mockSensor);

    const result = await repo.createSensor(
      networkCode, 
      gatewayMac, 
      sensorMac, 
      "Test Sensor", 
      "Description", 
      "temperature", 
      "°C"
    );

    expect(result).toBeInstanceOf(SensorDAO);
    expect(result.macAddress).toBe(sensorMac);
  });

  it("create sensor: conflict", async () => {
    mockFind.mockResolvedValue([mockSensor]);

    await expect(
      repo.createSensor(
        networkCode, 
        gatewayMac, 
        sensorMac, 
        "Different", 
        "Description", 
        "temperature", 
        "°C"
      )
    ).rejects.toThrow(ConflictError);
  });

  it("get sensor by mac", async () => {
    const result = await repo.getSensorByMac(networkCode, gatewayMac, sensorMac);
    expect(result.macAddress).toBe(sensorMac);
  });

  it("get sensor by mac: not found", async () => {
    await expect(
      repo.getSensorByMac(networkCode, gatewayMac, nonExistentMac)
    ).rejects.toThrow(NotFoundError);
  });

  it("delete sensor", async () => {
    await repo.deleteSensor(networkCode, gatewayMac, sensorMac);
    expect(mockRemove).toHaveBeenCalled();
  });
});