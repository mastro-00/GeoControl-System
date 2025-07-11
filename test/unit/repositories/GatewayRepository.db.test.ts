import { initializeTestDataSource, closeTestDataSource, TestDataSource } from "@test/setup/test-datasource";
import { GatewayRepository } from "@repositories/GatewayRepository";
import { NetworkRepository } from "@repositories/NetworkRepository";
import { NotFoundError } from "@models/errors/NotFoundError";
import { ConflictError } from "@models/errors/ConflictError";
import { SensorDAO } from "@dao/SensorDAO";
import { GatewayDAO } from "@models/dao/GatewayDAO";
import { NetworkDAO } from "@models/dao/NetworkDAO";

beforeAll(async () => {
  await initializeTestDataSource();
});

afterAll(async () => {
  await closeTestDataSource();
});

beforeEach(async () => {
  await TestDataSource.getRepository(SensorDAO).clear();
  await TestDataSource.getRepository(GatewayDAO).clear();
  await TestDataSource.getRepository(NetworkDAO).clear();
});

describe("GatewayRepository: SQLite in-memory", () => {
  const networkCode = "TEST_NET";
  const gatewayMac = "94:3F:BE:4C:4A:79";
  const gatewayName = "Test Gateway";
  const gatewayDescription = "Test Description";
  const updatedMac = "FF:FF:FF:FF:FF:FF";
  const updatedName = "Updated Gateway";
  const updatedDescription = "Updated Description";

  let repo: GatewayRepository;
  let networkRepo: NetworkRepository;

  beforeEach(async () => {
    repo = new GatewayRepository();
    networkRepo = new NetworkRepository();
    
    await networkRepo.createNetwork(networkCode, "Test Network", "Test Network Description");
  });

  it("create gateway", async () => {
    const gateway = await repo.createGateway(
      networkCode,
      gatewayMac,
      gatewayName,
      gatewayDescription
    );

    expect(gateway).toMatchObject({
      macAddress: gatewayMac,
      name: gatewayName,
      description: gatewayDescription
    });

    const found = await repo.getGatewayByMac(networkCode, gatewayMac);
    expect(found.macAddress).toBe(gatewayMac);
  });

  it("get gateways by network", async () => {
    await repo.createGateway(networkCode, "AA:BB:CC:DD:EE:FF", "Gateway 1", "Desc 1");
    await repo.createGateway(networkCode, "11:22:33:44:55:66", "Gateway 2", "Desc 2");

    const gateways = await repo.getGatewaysByNetwork(networkCode);
    expect(gateways.length).toBe(2);
    expect(gateways[0].macAddress).toBe("AA:BB:CC:DD:EE:FF");
    expect(gateways[1].macAddress).toBe("11:22:33:44:55:66");
  });

  it("find gateway by mac: not found", async () => {
    await expect(repo.getGatewayByMac(networkCode, "non:existent:mac"))
      .rejects.toThrow(NotFoundError);
  });

  it("create gateway: conflict", async () => {
    await repo.createGateway(networkCode, gatewayMac, gatewayName, gatewayDescription);
    await expect(
      repo.createGateway(networkCode, gatewayMac, "Different Name", "Different Desc")
    ).rejects.toThrow(ConflictError);
  });

  it("update gateway without changing mac", async () => {
    await repo.createGateway(networkCode, gatewayMac, gatewayName, gatewayDescription);

    await repo.updateGateway(
      networkCode,
      gatewayMac, 
      gatewayMac, 
      updatedName,
      updatedDescription
    );

    const updatedGateway = await repo.getGatewayByMac(networkCode, gatewayMac);
    expect(updatedGateway).toMatchObject({
      macAddress: gatewayMac,
      name: updatedName,
      description: updatedDescription
    });
  });

  it("update gateway with new mac", async () => {
    const originalGateway = await repo.createGateway(networkCode, gatewayMac, gatewayName, gatewayDescription);
    await TestDataSource.getRepository(SensorDAO).save([
      { macAddress: "AA:BB:CC:DD:EE:FF", name: "Sensor 1", gateway: originalGateway },
      { macAddress: "11:22:33:44:55:66", name: "Sensor 2", gateway: originalGateway }
    ]);

    await repo.updateGateway(
      networkCode,
      gatewayMac, 
      updatedMac, 
      updatedName,
      updatedDescription
    );

    await expect(repo.getGatewayByMac(networkCode, gatewayMac))
      .rejects.toThrow(NotFoundError);

    const updatedGateway = await repo.getGatewayByMac(networkCode, updatedMac);
    expect(updatedGateway.name).toBe(updatedName);
    expect(updatedGateway.description).toBe(updatedDescription);

    expect(updatedGateway.sensors.length).toBe(2);
    expect(updatedGateway.sensors[0].macAddress).toBe("11:22:33:44:55:66");
    expect(updatedGateway.sensors[1].macAddress).toBe("AA:BB:CC:DD:EE:FF");
  });

  it("delete gateway", async () => {
    await repo.createGateway(networkCode, gatewayMac, gatewayName, gatewayDescription);
    await repo.deleteGateway(networkCode, gatewayMac);
    
    await expect(repo.getGatewayByMac(networkCode, gatewayMac))
      .rejects.toThrow(NotFoundError);
  });

  it("delete gateway with sensors - should cascade", async () => {
    // Create gateway with sensors
    const gateway = await repo.createGateway(networkCode, gatewayMac, gatewayName, gatewayDescription);
    await TestDataSource.getRepository(SensorDAO).save([
      { macAddress: "AA:BB:CC:DD:EE:FF", name: "Sensor 1", gateway },
      { macAddress: "11:22:33:44:55:66", name: "Sensor 2", gateway }
    ]);

    // Verify sensors exist before deletion
    const sensorsBefore = await TestDataSource.getRepository(SensorDAO).find();
    expect(sensorsBefore.length).toBe(2);

    // Delete gateway
    await repo.deleteGateway(networkCode, gatewayMac);

    // Verify sensors were also deleted (assuming cascade is set up)
    const sensorsAfter = await TestDataSource.getRepository(SensorDAO).find();
    expect(sensorsAfter.length).toBe(0);
  });
});