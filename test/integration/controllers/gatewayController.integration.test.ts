import * as gatewayController from "@controllers/gatewayController";
import { GatewayDAO } from "@dao/GatewayDAO";
import { NetworkDAO } from "@models/dao/NetworkDAO";
import { GatewayRepository } from "@repositories/GatewayRepository";
import { NetworkRepository } from "@repositories/NetworkRepository";
import { Code } from "typeorm";

jest.mock("@repositories/GatewayRepository");
jest.mock("@repositories/NetworkRepository");

describe("GatewayController integration", () => {
  it("get Gateway: mapperService integration", async () => {

    const fakeGatewayDAO: GatewayDAO = {
      macAddress: "00:1A:2B:3C:4D:5E",
      name: "Test Gateway",
      description: "Test Description",
      sensors: [],
      network: new NetworkDAO()
    };

    const expectedGatewayDTO = {
      macAddress: fakeGatewayDAO.macAddress,
      name: fakeGatewayDAO.name,
      description: fakeGatewayDAO.description
    };

    (NetworkRepository as jest.Mock).mockImplementation(() => ({
      getNetworkByCode: jest.fn().mockResolvedValue({ code: "NET-001" })
    }));

    (GatewayRepository as jest.Mock).mockImplementation(() => ({
      getGatewayByMac: jest.fn().mockResolvedValue(fakeGatewayDAO)
    }));

    const result = await gatewayController.getGateway("NET-001", "00:1A:2B:3C:4D:5E");

    expect(result).not.toHaveProperty("sensors");
    expect(result).not.toHaveProperty("network"); 
    expect(result).toEqual(expectedGatewayDTO);
  });

});