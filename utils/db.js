const mongoose = require('mongoose');

/**
 * Returns true only if Mongoose has an active, ready connection.
 * Use this instead of wrapping every query in try/catch — that pattern
 * swallowed real bugs (validation errors, etc.) by routing them into
 * the in-memory fallback silently.
 */
function isDbConnected() {
  return mongoose.connection.readyState === 1;
}

module.exports = { isDbConnected };
