import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table
export default class Measurement extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  measure_uuid!: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  measure_value!: number;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  measure_datetime!: Date;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  measure_type!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  image_url!: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  has_confirmed!: boolean;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  customer_code!: string;
}
