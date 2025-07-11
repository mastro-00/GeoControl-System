import { AppDataSource } from "@database";
import { Repository } from "typeorm";
import { GatewayDAO } from "@dao/GatewayDAO";
import { SensorDAO } from "@dao/SensorDAO";
import { NetworkRepository } from "./NetworkRepository";
import { throwConflictIfFound } from "@utils";
import { NotFoundError } from "@models/errors/NotFoundError";

export class GatewayRepository {
    private networkRepo: NetworkRepository;
    private gatewayRepo: Repository<GatewayDAO>;
    private sensorRepo: Repository<SensorDAO>;

    constructor() {
        this.networkRepo = new NetworkRepository();
        this.gatewayRepo = AppDataSource.getRepository(GatewayDAO);
        this.sensorRepo = AppDataSource.getRepository(SensorDAO);
    }

    async getGatewaysByNetwork(networkCode: string): Promise<GatewayDAO[]> {
        const network = await this.networkRepo.getNetworkByCode(networkCode);
        return network.gateways;
    }

    async createGateway(networkCode: string, macAddress: string, name: string, description: string): Promise<GatewayDAO> {
        throwConflictIfFound(
            await this.gatewayRepo.find({ where: { macAddress } }),
            () => true,
            `Gateway with mac '${macAddress}' already exists`
        );

        const network = await this.networkRepo.getNetworkByCode(networkCode);

        return this.gatewayRepo.save({
            macAddress: macAddress,
            name: name,
            description: description,
            network,
            sensors: []
        });
    }

    async getGatewayByMac(networkCode:string, macAddress: string): Promise<GatewayDAO> {
        const network = await this.networkRepo.getNetworkByCode(networkCode);
        const gateway = network.gateways.find(gateway => gateway.macAddress === macAddress);
        if (!gateway) throw new NotFoundError(`Gateway with MAC '${macAddress}' not found in network '${networkCode}'`);
        return gateway;
    }

    async updateGateway(networkCode:string, oldMacAddress: string, newMacAddress?: string, newName?: string, newDescription?: string): Promise<void> {
        // 1. Check if the old gateway exists and belongs to the network
        const oldGateway = await this.getGatewayByMac(networkCode, oldMacAddress);

        // 2. If macAddress is the same or not provided, update properties directly
        if (!newMacAddress || oldMacAddress === newMacAddress) {
            if (newName !== undefined) oldGateway.name = newName;
            if (newDescription !== undefined) oldGateway.description = newDescription;
            await this.gatewayRepo.save(oldGateway);
            return;
        }

        // 3. Create a new gateway with the new mac address
        const newGateway = await this.createGateway(networkCode, newMacAddress, newName ?? oldGateway.name, newDescription ?? oldGateway.description);

        // 4. Transfer all sensors from old gateway to new gateway
        await this.sensorRepo.save(
            oldGateway.sensors.map(sensor => ({ 
                ...sensor,
                gateway: newGateway 
            }))
        );

        // 5. Remove old gateway
        await this.gatewayRepo.remove(oldGateway);
    }

    async deleteGateway(networkCode:string, macAddress: string): Promise<void> {
        await this.gatewayRepo.remove(await this.getGatewayByMac(networkCode, macAddress));
    }
}