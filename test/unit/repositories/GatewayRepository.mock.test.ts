import { GatewayRepository } from "@repositories/GatewayRepository";
import { GatewayDAO } from "@dao/GatewayDAO";
import { ConflictError } from "@models/errors/ConflictError";
import { NotFoundError } from "@models/errors/NotFoundError";

const mockFind = jest.fn();
const mockSave = jest.fn();
const mockRemove = jest.fn();

// Create a mock GatewayDAO instance
const mockGateway = new GatewayDAO();
mockGateway.macAddress = "AA:BB:CC:DD:EE:FF";
mockGateway.name = "Test Gateway";

// Create a mock NetworkDAO instance with gateways
const mockNetwork = {
  code: "TEST_NET",
  gateways: [mockGateway]
};

jest.mock("@repositories/NetworkRepository", () => {
  return {
    NetworkRepository: jest.fn().mockImplementation(() => ({
      getNetworkByCode: jest.fn().mockImplementation((code: string) => {
        if (code === "TEST_NET") {
          return Promise.resolve(mockNetwork);
        }
        return Promise.resolve({ code, gateways: [] });
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

describe("GatewayRepository: mocked database", () => {
  let repo: GatewayRepository;
  const networkCode = "TEST_NET";
  const gatewayMac = "AA:BB:CC:DD:EE:FF";
  const nonExistentMac = "00:00:00:00:00:00";

  beforeEach(() => {
    jest.clearAllMocks();
    repo = new GatewayRepository();
  });

  it("create gateway", async () => {
    mockFind.mockResolvedValue([]);
    mockSave.mockResolvedValue(mockGateway);

    const result = await repo.createGateway(networkCode, gatewayMac, "Test Gateway", "Description");
    
    expect(result).toBeInstanceOf(GatewayDAO);
    expect(result.macAddress).toBe(gatewayMac);
    expect(mockSave).toHaveBeenCalledWith(expect.objectContaining({
      macAddress: gatewayMac,
      name: "Test Gateway"
    }));
  });

  it("create gateway: conflict", async () => {
    mockFind.mockResolvedValue([mockGateway]);

    await expect(
      repo.createGateway(networkCode, gatewayMac, "Different", "Different")
    ).rejects.toThrow(ConflictError);
  });

  it("get gateway by mac", async () => {
    const result = await repo.getGatewayByMac(networkCode, gatewayMac);
    expect(result.macAddress).toBe(gatewayMac);
  });

  it("get gateway by mac: not found", async () => {
    await expect(repo.getGatewayByMac(networkCode, nonExistentMac))
      .rejects.toThrow(NotFoundError);
  });

  it("delete gateway", async () => {
    await repo.deleteGateway(networkCode, gatewayMac);
    expect(mockRemove).toHaveBeenCalled();
  });
});