import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn} from "typeorm";
import { SensorDAO } from "@dao/SensorDAO";

@Entity("measurement")
export class MeasurementDAO {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    createdAt: Date;

    @Column({ nullable: false, type: 'real' })
    value: number;

    @Column({ nullable: true, default: null })
    isOutlier?: boolean;

    @ManyToOne(() => SensorDAO, sensor => sensor.measurements, { onDelete: "CASCADE", nullable: false })
    @JoinColumn({ name: "sensor_macAddress" })
    sensor: SensorDAO;
}