import { Sequelize } from 'sequelize-typescript';

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: 'db',
  username: 'admin',
  password: 'admin',
  database: 'shopper_db',
  models: [__dirname + '../models'],
  logging: true,
});

export default sequelize;
