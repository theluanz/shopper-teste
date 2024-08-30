import { Table, Column, Model, DataType, ForeignKey, BelongsToMany } from 'sequelize-typescript';
import Customer from './customer';

@Table
export default class Measurement extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  measure_uuid!: string;

  @Column(DataType.INTEGER)
  measure_value!: number;

  @Column(DataType.DATE)
  measure_datetime!: Date;

  @Column(DataType.STRING)
  measure_type!: string;

  @Column(DataType.STRING)
  image_url!: string;

  @Column(DataType.INTEGER)
  confirmed!: number;

  @BelongsToMany(() => Customer, 'MeasurementCustomer', 'measurement_id', 'customer_id')
  customers!: Customer[];
}
