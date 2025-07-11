import { NetworkRepository } from "@repositories/NetworkRepository";
import { NetworkDAO } from "@dao/NetworkDAO";
import { ConflictError } from "@models/errors/ConflictError";
import { NotFoundError } from "@models/errors/NotFoundError";

const mockFind = jest.fn();
const mockSave = jest.fn();
const mockRemove = jest.fn();

jest.mock("@database", () => ({
  AppDataSource: {
    getRepository: () => ({
      find: mockFind,
      save: mockSave,
      remove: mockRemove
    })
  }
}));

describe("NetworkRepository: mocked database", () => {
  const repo = new NetworkRepository();
  const networkCode = "TEST_NET";
  const networkName = "Test Network";
  const networkDescription = "Test Description";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("create network", async () => {
    mockFind.mockResolvedValue([]);

    const savedNetwork = new NetworkDAO();
    savedNetwork.code = networkCode;
    savedNetwork.name = networkName;
    savedNetwork.description = networkDescription;

    mockSave.mockResolvedValue(savedNetwork);

    const result = await repo.createNetwork(networkCode, networkName, networkDescription);

    expect(result).toBeInstanceOf(NetworkDAO);
    expect(result.code).toBe(networkCode);
    expect(result.name).toBe(networkName);
    expect(mockSave).toHaveBeenCalledWith({
      code: networkCode,
      name: networkName,
      description: networkDescription,
      gateways: []
    });
  });

  it("create network: conflict", async () => {
    const existingNetwork = new NetworkDAO();
    existingNetwork.code = networkCode;

    mockFind.mockResolvedValue([existingNetwork]);

    await expect(
      repo.createNetwork(networkCode, "Different", "Different")
    ).rejects.toThrow(ConflictError);
  });

  it("get network by code", async () => {
    const foundNetwork = new NetworkDAO();
    foundNetwork.code = networkCode;
    foundNetwork.name = networkName;

    mockFind.mockResolvedValue([foundNetwork]);

    const result = await repo.getNetworkByCode(networkCode);
    expect(result).toBe(foundNetwork);
  });

  it("get network by code: not found", async () => {
    mockFind.mockResolvedValue([]);

    await expect(repo.getNetworkByCode("ghost")).rejects.toThrow(NotFoundError);
  });

  it("delete network", async () => {
    const network = new NetworkDAO();
    network.code = networkCode;

    mockFind.mockResolvedValue([network]);
    mockRemove.mockResolvedValue(undefined);

    await repo.deleteNetwork(networkCode);

    expect(mockRemove).toHaveBeenCalledWith(network);
  });
});