// empty-module.js
// Stub module that resolves @opentelemetry/* imports to nothing.
// Metro's resolveRequest returns this file for all OTel packages,
// preventing Hermes from encountering dynamic import() expressions
// that it cannot compile in production builds.
module.exports = {};
