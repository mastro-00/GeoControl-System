import { Gateway as GatewayDTO } from "@dto/Gateway";
import { GatewayRepository } from "@repositories/GatewayRepository";
import { mapGatewayDAOToDTO } from "@services/mapperService";

export async function getGatewaysByNetwork(netCode : string): Promise<GatewayDTO[]> {
    const gatewayRepo = new GatewayRepository();
    return (await gatewayRepo.getGatewaysByNetwork(netCode)).map(mapGatewayDAOToDTO);
}

export async function createGateway(networkCode: string, gatewayDto: GatewayDTO): Promise<void> {
    const gatewayRepo = new GatewayRepository();
    await gatewayRepo.createGateway(
        networkCode,
        gatewayDto.macAddress,
        gatewayDto.name,
        gatewayDto.description
    );
}

export async function getGateway(networkCode:string, macAddress: string): Promise<GatewayDTO> {
    const gatewayRepo = new GatewayRepository();
    return mapGatewayDAOToDTO(await gatewayRepo.getGatewayByMac(networkCode, macAddress));
}

export async function updateGateway(networkCode:string, macAddress: string, gatewayDto: GatewayDTO): Promise<void> {
    const gatewayRepo = new GatewayRepository();
    await gatewayRepo.updateGateway(networkCode, macAddress, gatewayDto.macAddress, gatewayDto.name, gatewayDto.description);
}

export async function deleteGateway(networkCode:string, macAddress: string): Promise<void> {
    const gatewayRepo = new GatewayRepository();
    await gatewayRepo.deleteGateway(networkCode, macAddress);
}