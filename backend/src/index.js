require('dotenv').config();

// Fail fast: authentication must never run with a missing or predictable secret.
if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET is not set. Add it to your .env file or environment before starting the server.');
  process.exit(1);
}

const app = require('./createApp');
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => console.log(`Present Foods API running on port ${PORT}`));

// Graceful shutdown: drain connections before exiting
function shutdown(signal) {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
  // Force exit after 10 seconds if connections haven't drained
  setTimeout(() => {
    console.error('Forced shutdown after timeout.');
    process.exit(1);
  }, 10_000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
