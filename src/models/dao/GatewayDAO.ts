import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { NetworkDAO } from "@dao/NetworkDAO";
import { SensorDAO } from "@dao/SensorDAO";

@Entity("gateways")
export class GatewayDAO {
    @PrimaryColumn({ nullable: false })
    macAddress: string;

    @Column({ nullable: true })
    name?: string;

    @Column({ nullable: true })
    description?: string;

    @ManyToOne(() => NetworkDAO, network => network.gateways, { onDelete: "CASCADE", nullable: false })
    @JoinColumn({ name: "network_code" })
    network: NetworkDAO;

    @OneToMany(() => SensorDAO, sensor => sensor.gateway, { cascade: true, eager: true })
    sensors: SensorDAO[];
}