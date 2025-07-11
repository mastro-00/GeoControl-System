import { Network as NetworkDTO } from "@dto/Network";
import { NetworkRepository } from "@repositories/NetworkRepository";
import { mapNetworkDAOToDTO } from "@services/mapperService";

export async function getAllNetworks(): Promise<NetworkDTO[]> {
    const networkRepo = new NetworkRepository();
    return (await networkRepo.getAllNetworks()).map(mapNetworkDAOToDTO);
}

export async function createNetwork(networkDto: NetworkDTO): Promise<void> {
    const networkRepo = new NetworkRepository();
    await networkRepo.createNetwork(
        networkDto.code,
        networkDto.name,
        networkDto.description
    );
}

export async function getNetwork(code: string): Promise<NetworkDTO> {
    const networkRepo = new NetworkRepository();
    return mapNetworkDAOToDTO(await networkRepo.getNetworkByCode(code));
}

export async function updateNetwork(code: string, newNetwork: NetworkDTO): Promise<void> {
    const networkRepo = new NetworkRepository();
    await networkRepo.updateNetwork(code, newNetwork.code, newNetwork.name, newNetwork.description);
}

export async function deleteNetwork(code: string): Promise<void> {
    const networkRepo = new NetworkRepository();
    await networkRepo.deleteNetwork(code);
}