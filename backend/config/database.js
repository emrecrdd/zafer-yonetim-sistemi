import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

let sequelize;

if (process.env.DATABASE_URL) {
  // 🌐 Render veya üretim ortamı (Neon gibi)
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    protocol: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // Neon için gerekli
      },
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
  });
} else {
  // 💻 Lokal ortam (localhost PostgreSQL)
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      dialect: 'postgres',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
    }
  );
}

export default sequelize;
