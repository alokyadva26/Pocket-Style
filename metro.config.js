// metro.config.js
// =============================================================================
// PocketStylist — Metro Bundler Configuration
// =============================================================================
//
// Key fix: @supabase/supabase-js (v2.47+) and some transitive dependencies
// optionally import @opentelemetry/* packages using dynamic import() syntax
// that Hermes cannot compile in production builds.
//
// We stub those packages to an empty module so Metro never bundles
// the dynamic import() expression into the output bundle.

const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Path to our empty stub module
const EMPTY_MODULE = path.resolve(__dirname, 'empty-module.js');

// Packages to stub out — all optional OTel peer deps from supabase
const OTEL_PACKAGES = [
  '@opentelemetry/api',
  '@opentelemetry/core',
  '@opentelemetry/semantic-conventions',
  '@opentelemetry/instrumentation',
  '@opentelemetry/sdk-trace-base',
  '@opentelemetry/sdk-trace-web',
  '@opentelemetry/sdk-node',
  '@opentelemetry/resources',
];

config.resolver.resolveRequest = (context, moduleName, platform) => {
  const isOtel = OTEL_PACKAGES.some(
    (pkg) => moduleName === pkg || moduleName.startsWith(pkg + '/')
  );

  if (isOtel) {
    // Resolve to the empty stub — no dynamic import(), no Hermes crash
    return {
      filePath: EMPTY_MODULE,
      type: 'sourceFile',
    };
  }

  // Default resolution for all other modules
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
