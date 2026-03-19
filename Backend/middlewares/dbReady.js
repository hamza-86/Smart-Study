const mongoose = require("mongoose");
const APIError = require("../utils/apiError");

const requireDbConnection = (_req, _res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return next(APIError.externalAPI("Database is not ready. Please retry shortly."));
  }
  return next();
};

module.exports = { requireDbConnection };
