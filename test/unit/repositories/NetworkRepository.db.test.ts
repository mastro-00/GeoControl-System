import { initializeTestDataSource, closeTestDataSource, TestDataSource } from "@test/setup/test-datasource";
import { NetworkRepository } from "@repositories/NetworkRepository";
import { NotFoundError } from "@models/errors/NotFoundError";
import { ConflictError } from "@models/errors/ConflictError";
import { GatewayDAO } from "@dao/GatewayDAO"
import { NetworkDAO } from "@models/dao/NetworkDAO";

beforeAll(async () => {
  await initializeTestDataSource();
});

afterAll(async () => {
  await closeTestDataSource();
});

beforeEach(async () => {
  await TestDataSource.getRepository(GatewayDAO).clear();
  await TestDataSource.getRepository(NetworkDAO).clear();
});

describe("NetworkRepository: SQLite in-memory", () => {
  const networkCode = "TEST_NET";
  const networkName = "Test Network";
  const networkDescription = "Test Description";
  const updatedCode = "UPDATED_NET";
  const updatedName = "Updated Network";
  const updatedDescription = "Updated Description";

  let repo: NetworkRepository;

  beforeEach(() => {
    repo = new NetworkRepository();
  });

  it("create network", async () => {
    const network = await repo.createNetwork(networkCode, networkName, networkDescription);
    
    expect(network).toMatchObject({
      code: networkCode,
      name: networkName,
      description: networkDescription
    });

    const found = await repo.getNetworkByCode(networkCode);
    expect(found.code).toBe(networkCode);
  });

  it("get all networks", async () => {
    await repo.createNetwork("NET_1", "Network 1", "Description 1");
    await repo.createNetwork("NET_2", "Network 2", "Description 2");

    const networks = await repo.getAllNetworks();
    expect(networks.length).toBe(2);
    expect(networks[0].code).toBe("NET_1");
    expect(networks[1].code).toBe("NET_2");
  });

  it("find network by code: not found", async () => {
    await expect(repo.getNetworkByCode("NON_EXISTENT"))
      .rejects.toThrow(NotFoundError);
  });

  it("create network: conflict", async () => {
    await repo.createNetwork(networkCode, networkName, networkDescription);
    await expect(
      repo.createNetwork(networkCode, "Different Name", "Different Description")
    ).rejects.toThrow(ConflictError);
  });

  it("update network without changing code", async () => {
    await repo.createNetwork(networkCode, networkName, networkDescription);

    await repo.updateNetwork(
      networkCode, 
      networkCode, 
      updatedName,
      updatedDescription
    );

    const updatedNetwork = await repo.getNetworkByCode(networkCode);
    expect(updatedNetwork).toMatchObject({
      code: networkCode,
      name: updatedName,
      description: updatedDescription
    });
  });

  it("update network with new code", async () => {
    const originalNetwork = await repo.createNetwork(networkCode, networkName, networkDescription);
    await TestDataSource.getRepository(GatewayDAO).save([
      { macAddress: "AA:BB:CC:DD:EE:FF", name: "Gateway 1", network: originalNetwork },
      { macAddress: "11:22:33:44:55:66", name: "Gateway 2", network: originalNetwork }
    ]);

    await repo.updateNetwork(
      networkCode, 
      updatedCode, 
      updatedName,
      updatedDescription
    );

    await expect(repo.getNetworkByCode(networkCode))
      .rejects.toThrow(NotFoundError);

    const updatedNetwork = await repo.getNetworkByCode(updatedCode);
    expect(updatedNetwork.name).toBe(updatedName);
    expect(updatedNetwork.description).toBe(updatedDescription);

    expect(updatedNetwork.gateways.length).toBe(2);
    expect(updatedNetwork.gateways[0].macAddress).toBe("AA:BB:CC:DD:EE:FF");
    expect(updatedNetwork.gateways[1].macAddress).toBe("11:22:33:44:55:66");
  });

  it("delete network", async () => {
    await repo.createNetwork(networkCode, networkName, networkDescription);
    await repo.deleteNetwork(networkCode);
    
    await expect(repo.getNetworkByCode(networkCode))
      .rejects.toThrow(NotFoundError);
  });

  it("delete network with gateways - should cascade", async () => {
    const network = await repo.createNetwork(networkCode, networkName, networkDescription);
    await TestDataSource.getRepository(GatewayDAO).save([
      { macAddress: "AA:BB:CC:DD:EE:FF", name: "Gateway 1", network },
      { macAddress: "11:22:33:44:55:66", name: "Gateway 2", network }
    ]);

    const gatewaysBefore = await TestDataSource.getRepository(GatewayDAO).find();
    expect(gatewaysBefore.length).toBe(2);

    await repo.deleteNetwork(networkCode);

    const gatewaysAfter = await TestDataSource.getRepository(GatewayDAO).find();
    expect(gatewaysAfter.length).toBe(0);
  });
});