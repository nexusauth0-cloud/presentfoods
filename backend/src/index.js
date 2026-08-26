require('dotenv').config();

// Fail fast: authentication must never run with a missing or predictable secret.
if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET is not set. Add it to your .env file or environment before starting the server.');
  process.exit(1);
}

const app = require('./createApp');
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Present Foods API running on port ${PORT}`));
