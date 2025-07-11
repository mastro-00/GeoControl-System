import { AppDataSource } from "@database";
import { Repository } from "typeorm";
import { NetworkDAO } from "@dao/NetworkDAO";
import { GatewayDAO } from "@dao/GatewayDAO";
import { findOrThrowNotFound, throwConflictIfFound } from "@utils";

export class NetworkRepository {
    private networkRepo: Repository<NetworkDAO>;
    private gatewayRepo: Repository<GatewayDAO>;

    constructor() {
        this.networkRepo = AppDataSource.getRepository(NetworkDAO);
        this.gatewayRepo = AppDataSource.getRepository(GatewayDAO);
    }

    getAllNetworks(): Promise<NetworkDAO[]> {
        return this.networkRepo.find();
    }

    async createNetwork(code: string, name: string, description: string): Promise<NetworkDAO> {
        throwConflictIfFound(
            await this.networkRepo.find({ where: { code } }),
            () => true,
            `Network with code '${code}' already exists`
        );

        return this.networkRepo.save({
            code: code,
            name: name,
            description: description,
            gateways: []
        });
    }

    async getNetworkByCode(code: string): Promise<NetworkDAO> {
        return findOrThrowNotFound(
            await this.networkRepo.find({ where: { code }, relations: ["gateways"]}),
            () => true,
            `Network with code '${code}' not found`
        );
    }

    async updateNetwork(oldCode: string, newCode?: string, newName?: string, newDescription?: string): Promise<void> {
        // 1. Check if the old network exists
        const oldNetwork = await this.getNetworkByCode(oldCode);

        // 2. If the code hasn't changed or is not provided, just update other properties
        if (!newCode || oldCode === newCode) {
            if (newName !== undefined) oldNetwork.name = newName;
            if (newDescription !== undefined) oldNetwork.description = newDescription;
            await this.networkRepo.save(oldNetwork);
            return;
        }

        // 3. Create a new network with the new code
        const newNetwork = await this.createNetwork(newCode, newName ?? oldNetwork.name, newDescription ?? oldNetwork.description);

        // 4. Transfer all gateways from old network to new network
        await this.gatewayRepo.save(
            oldNetwork.gateways.map(gateway => ({
                ...gateway,
                network: newNetwork
            }))
        );

        // 5. Delete the old network
        await this.networkRepo.remove(oldNetwork);
    }

    async deleteNetwork(code: string): Promise<void> {
        await this.networkRepo.remove(await this.getNetworkByCode(code));
    }
}