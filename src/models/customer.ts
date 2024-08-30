import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import Measurement from './measurement'; // Adjust import path if necessary

@Table
export default class Customer extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  customer_code!: string;

  @HasMany(() => Measurement)
  measurements!: Measurement[];
}
