const app = require('./app');
const logger = require('./shared/utils/logger');
require('dotenv').config();

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});