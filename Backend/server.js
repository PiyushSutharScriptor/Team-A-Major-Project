require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const { startEscalationCron } = require('./services/escalationCron');
const AdminEmail = require('./models/AdminEmail');

const PORT = process.env.PORT || 5000;

const seedFirstAdmin = async () => {
  try {
    const count = await AdminEmail.countDocuments();
    if (count === 0) {
      await AdminEmail.create({ email: 'admin@system.com' });
      console.log('🌱 Seeded first admin email: admin@system.com');
    }
  } catch (error) {
    console.error('Failed to seed admin:', error.message);
  }
};

const startServer = async () => {
  await connectDB();
  await seedFirstAdmin();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📋 Environment: ${process.env.NODE_ENV}`);
  });

  // Start cron jobs after DB is connected
  startEscalationCron();
};

startServer();
