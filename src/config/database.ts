import { Sequelize } from 'sequelize-typescript';

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: 'localhost',
  username: 'admin',
  password: 'admin',
  database: 'shopper_db',
  models: [__dirname + '/models'],
});

export default sequelize;
