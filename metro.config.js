// metro.config.js
// =============================================================================
// PocketStylist — Metro Bundler Configuration
// =============================================================================
//
// Fix: @supabase/supabase-js pulls in optional @opentelemetry/* packages
// that contain dynamic import() syntax Hermes cannot compile.
//
// Solution: Map all @opentelemetry/* to an empty stub module via
// extraNodeModules — this is the universally supported Metro approach
// and works reliably across all Expo SDK 54 builds.

const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Path to our empty stub — resolves all OTel imports to a no-op module
const EMPTY_MODULE = path.resolve(__dirname, 'empty-module.js');

// Map every @opentelemetry/* package to the empty stub.
// This prevents Metro from ever bundling the dynamic import() calls
// that Supabase uses for optional OTel tracing — Hermes can't compile those.
config.resolver.extraNodeModules = {
  '@opentelemetry/api': EMPTY_MODULE,
  '@opentelemetry/core': EMPTY_MODULE,
  '@opentelemetry/semantic-conventions': EMPTY_MODULE,
  '@opentelemetry/instrumentation': EMPTY_MODULE,
  '@opentelemetry/sdk-trace-base': EMPTY_MODULE,
  '@opentelemetry/sdk-trace-web': EMPTY_MODULE,
  '@opentelemetry/sdk-node': EMPTY_MODULE,
  '@opentelemetry/resources': EMPTY_MODULE,
};

module.exports = config;
