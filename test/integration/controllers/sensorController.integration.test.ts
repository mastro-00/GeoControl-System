import * as sensorController from "@controllers/sensorController";
import { SensorDAO } from "@dao/SensorDAO";
import { SensorRepository } from "@repositories/SensorRepository";
import { GatewayRepository } from "@repositories/GatewayRepository";
import { NetworkRepository } from "@repositories/NetworkRepository";
import { GatewayDAO } from "@models/dao/GatewayDAO";
import { NetworkDAO } from "@models/dao/NetworkDAO";

jest.mock("@repositories/SensorRepository");
jest.mock("@repositories/GatewayRepository");
jest.mock("@repositories/NetworkRepository");

describe("SensorController integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("get Sensor: mapperService integration - should remove empty measurements", async () => {
    const networkCode = "NET-001";
    const gatewayMac = "11:11:11:11:11:11";
    const sensorMac = "00:1A:2B:3C:4D:5F";

    const fakeGatewayDAO: GatewayDAO = {
      macAddress: gatewayMac,
      name: "Test Gateway",
      sensors: [],
      network: new NetworkDAO()
      
    };

    const fakeSensorDAO: SensorDAO = {
      macAddress: sensorMac,
      name: "Test Sensor",
      description: "Test Description",
      variable: "temperature",
      unit: "°C",
      measurements: [],
      gateway: fakeGatewayDAO
    };

    fakeGatewayDAO.sensors.push(fakeSensorDAO);

    const expectedSensorDTO = {
      macAddress: fakeSensorDAO.macAddress,
      name: fakeSensorDAO.name,
      description: fakeSensorDAO.description,
      variable: fakeSensorDAO.variable,
      unit: fakeSensorDAO.unit
    };

    const mockGetNetworkByCode = jest.fn().mockResolvedValue({ code: networkCode });
    const mockGetGatewayByMac = jest.fn().mockResolvedValue(fakeGatewayDAO);
    const mockGetSensorsByGateway = jest.fn().mockResolvedValue(fakeGatewayDAO.sensors);

    (NetworkRepository as jest.Mock).mockImplementation(() => ({
      getNetworkByCode: mockGetNetworkByCode
    }));

    (GatewayRepository as jest.Mock).mockImplementation(() => ({
      getGatewayByMac: mockGetGatewayByMac
    }));

    (SensorRepository as jest.Mock).mockImplementation(() => ({
      getSensorsByGateway: mockGetSensorsByGateway,
      getSensorByMac: jest.fn().mockImplementation(async (netCode, gwMac, sMac) => {
        const sensors = await mockGetSensorsByGateway(netCode, gwMac);
        return sensors.find(s => s.macAddress === sMac);
      })
    }));


    const result = await sensorController.getSensorByMac(networkCode, gatewayMac, sensorMac);

    expect(result).toEqual(expectedSensorDTO);
    expect(result).not.toHaveProperty("measurements");
    expect(result).not.toHaveProperty("gateway");
    expect(result).not.toHaveProperty("gatewayId");

    expect(mockGetSensorsByGateway).toHaveBeenCalledWith(networkCode, gatewayMac);
  });
});