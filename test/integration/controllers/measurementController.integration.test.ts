import * as measurementController from "@controllers/measurementController";
import { MeasurementRepository } from "@repositories/MeasurementRepository";
import { SensorRepository } from "@repositories/SensorRepository";
import { GatewayRepository } from "@repositories/GatewayRepository";
import { NetworkRepository } from "@repositories/NetworkRepository";
import { MeasurementDAO } from "@dao/MeasurementDAO";
import { SensorDAO } from "@dao/SensorDAO";
import { GatewayDAO } from "@dao/GatewayDAO";
import { NetworkDAO } from "@dao/NetworkDAO";
import { NotFoundError } from "@models/errors/NotFoundError";
import { Measurements } from "@dto/Measurements";

jest.mock("@repositories/MeasurementRepository");
jest.mock("@repositories/SensorRepository");
jest.mock("@repositories/GatewayRepository");
jest.mock("@repositories/NetworkRepository");

describe("MeasurementController integration", () => {
  let mockMeasurementRepo: jest.Mocked<MeasurementRepository>;
  let mockSensorRepo: jest.Mocked<SensorRepository>;
  let mockGatewayRepo: jest.Mocked<GatewayRepository>;
  let mockNetworkRepo: jest.Mocked<NetworkRepository>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockMeasurementRepo = {
      getAllMeasurementsBySensor: jest.fn(),
      getAllMeasurementsByNetwork: jest.fn(),
      createMeasurement: jest.fn()
    } as unknown as jest.Mocked<MeasurementRepository>;

    mockSensorRepo = {
      getSensorByMac: jest.fn(),
      getSensorsByGateway: jest.fn()
    } as unknown as jest.Mocked<SensorRepository>;

    mockGatewayRepo = {
      getGatewayByMac: jest.fn(),
      getGatewaysByNetwork: jest.fn()
    } as unknown as jest.Mocked<GatewayRepository>;

    mockNetworkRepo = {
      getNetworkByCode: jest.fn()
    } as unknown as jest.Mocked<NetworkRepository>;

    (MeasurementRepository as jest.Mock).mockImplementation(() => mockMeasurementRepo);
    (SensorRepository as jest.Mock).mockImplementation(() => mockSensorRepo);
    (GatewayRepository as jest.Mock).mockImplementation(() => mockGatewayRepo);
    (NetworkRepository as jest.Mock).mockImplementation(() => mockNetworkRepo);
  });

  it("getAllMeasurementsBySensor: should properly format measurements with stats", async () => {
    const networkCode = "NET-001";
    const gatewayMac = "11:11:11:11:11:11";
    const sensorMac = "00:1A:2B:3C:4D:5F";
    const startDate = new Date("2023-01-01");
    const endDate = new Date("2023-01-02");

    const expectedResult: Measurements = {
      sensorMacAddress: sensorMac,
      stats: {
        startDate,
        endDate,
        mean: 20,
        variance: 66.66666666666667,
        upperThreshold: 36.329931618554525,
        lowerThreshold: 3.6700683814454784
      },
      measurements: [
        {
          createdAt: new Date("2023-01-01T00:00:00Z"),
          value: 10,
          isOutlier: false
        },
        {
          createdAt: new Date("2023-01-01T12:00:00Z"),
          value: 20,
          isOutlier: false
        },
        {
          createdAt: new Date("2023-01-02T00:00:00Z"),
          value: 30,
          isOutlier: true
        }
      ]
    };

    mockMeasurementRepo.getAllMeasurementsBySensor.mockResolvedValue(expectedResult);

    const result = await measurementController.getAllMeasurementsBySensor(
      networkCode,
      gatewayMac,
      sensorMac,
      startDate,
      endDate
    );

    expect(result).toEqual(expectedResult);
    expect(mockMeasurementRepo.getAllMeasurementsBySensor).toHaveBeenCalledWith(
      networkCode,
      gatewayMac,
      sensorMac,
      startDate,
      endDate
    );
  });

  it("getAllMeasurementsByNetwork: should aggregate measurements from multiple sensors", async () => {
    const networkCode = "NET-001";
    const startDate = new Date("2023-01-01");
    const endDate = new Date("2023-01-02");

    const expectedResults: Measurements[] = [
      {
        sensorMacAddress: "SENSOR-1",
        stats: {
          startDate,
          endDate,
          mean: 10,
          variance: 0,
          upperThreshold: 10,
          lowerThreshold: 10
        },
        measurements: [
          {
            createdAt: new Date("2023-01-01T00:00:00Z"),
            value: 10,
            isOutlier: false
          }
        ]
      },
      {
        sensorMacAddress: "SENSOR-2",
        stats: {
          startDate,
          endDate,
          mean: 20,
          variance: 0,
          upperThreshold: 20,
          lowerThreshold: 20
        },
        measurements: [
          {
            createdAt: new Date("2023-01-01T12:00:00Z"),
            value: 20,
            isOutlier: false
          }
        ]
      }
    ];

    mockMeasurementRepo.getAllMeasurementsByNetwork.mockResolvedValue(expectedResults);

    const result = await measurementController.getAllMeasurementsByNetwork(
      networkCode,
      [], 
      startDate,
      endDate
    );

    expect(result).toEqual(expectedResults);
    expect(result).toHaveLength(2);
    expect(result[0].sensorMacAddress).toBe("SENSOR-1");
    expect(result[1].sensorMacAddress).toBe("SENSOR-2");
    expect(mockMeasurementRepo.getAllMeasurementsByNetwork).toHaveBeenCalledWith(
      networkCode,
      [],
      startDate,
      endDate
    );
  });

  it("should filter measurements by date range", async () => {
    const networkCode = "NET-001";
    const gatewayMac = "GW-1";
    const sensorMac = "SENSOR-1";
    const startDate = new Date("2023-01-02");
    const endDate = new Date("2023-01-03");

    const expectedResult: Measurements = {
      sensorMacAddress: sensorMac,
      stats: {
        startDate,
        endDate,
        mean: 20,
        variance: 0,
        upperThreshold: 20,
        lowerThreshold: 20
      },
      measurements: [
        {
          createdAt: new Date("2023-01-02T12:00:00Z"),
          value: 20,
          isOutlier: false
        }
      ]
    };

    mockMeasurementRepo.getAllMeasurementsBySensor.mockResolvedValue(expectedResult);

    const result = await measurementController.getAllMeasurementsBySensor(
      networkCode,
      gatewayMac,
      sensorMac,
      startDate,
      endDate
    );

    expect(result.measurements).toHaveLength(1);
    expect(result.measurements[0].value).toBe(20);
  });

  it("should throw NotFoundError when sensor doesn't exist", async () => {
    const networkCode = "NET-001";
    const gatewayMac = "GW-1";
    const sensorMac = "NON-EXISTENT";
    const startDate = new Date("2023-01-02");
    const endDate = new Date("2023-01-03");

    mockMeasurementRepo.getAllMeasurementsBySensor.mockRejectedValue(
      new NotFoundError("Sensor not found")
    );

    await expect(
      measurementController.getAllMeasurementsBySensor(
        networkCode,
        gatewayMac,
        sensorMac,
        startDate,
        endDate
      )
    ).rejects.toThrow("Sensor not found");
  });
});