import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, OneToMany} from "typeorm";
import { GatewayDAO } from "@dao/GatewayDAO";
import { MeasurementDAO } from "@dao/MeasurementDAO";

@Entity("sensors")
export class SensorDAO {
    @PrimaryColumn({ nullable: false })
    macAddress: string;

    @Column({ nullable: true })
    name?: string;

    @Column({ nullable: true })
    description?: string;

    @Column({ nullable: true })
    variable?: string;

    @Column({ nullable: true })
    unit?: string;

    @ManyToOne(() => GatewayDAO, gateway => gateway.sensors, { onDelete: "CASCADE", nullable: false })
    @JoinColumn({ name: "gateway_macAddress" })
    gateway: GatewayDAO;

    @OneToMany(() => MeasurementDAO, measurement => measurement.sensor, { cascade: true, eager: true })
    measurements: MeasurementDAO[];
}