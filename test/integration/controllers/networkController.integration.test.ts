import * as networkController from "@controllers/networkController";
import { NetworkDAO } from "@dao/NetworkDAO";
import { NetworkRepository } from "@repositories/NetworkRepository";

jest.mock("@repositories/NetworkRepository");

describe("NetworkController integration", () => {
  it("get Network: mapperService integration", async () => {
    const fakeNetworkDAO: NetworkDAO = {
      code: "NET-001",
      name: "Test Network",
      description: "Test Description",
      gateways: []
    };
    //Mapper Service removes all empty attributes
    //So to test created a mock "DAO" without gateway attribute 
    const testNetworkDAO = {
      code: "NET-001",
      name: "Test Network",
      description: "Test Description", 
    };

    const expectedDTO = {
      code: fakeNetworkDAO.code,
      name: fakeNetworkDAO.name,
      description: fakeNetworkDAO.description,
      gateways: fakeNetworkDAO.gateways
    };

    (NetworkRepository as jest.Mock).mockImplementation(() => ({
      getNetworkByCode: jest.fn().mockResolvedValue(fakeNetworkDAO)
    }));

    const result = await networkController.getNetwork("NET-001");

    expect(result).not.toHaveProperty("gateways");
    expect(result).not.toHaveProperty("createdAt");
    expect(result).toEqual(testNetworkDAO); 
  });
});