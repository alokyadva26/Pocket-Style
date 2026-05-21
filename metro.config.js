// metro.config.js
// =============================================================================
// PocketStylist — Metro Bundler Configuration
// =============================================================================
//
// Two classes of modules need to be stubbed for React Native / Hermes builds:
//
// 1. @opentelemetry/* — Optional tracing peer deps of @supabase/supabase-js.
//    They contain dynamic import() syntax that Hermes cannot compile.
//
// 2. Node built-ins required by @supabase/realtime-js's bundled `ws` package
//    (`stream`, `ws`). React Native ships its own WebSocket implementation,
//    so we stub the Node.js ws library to prevent Metro from trying to resolve
//    Node core modules that don't exist in the RN environment.

const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Path to our empty no-op module
const EMPTY_MODULE = path.resolve(__dirname, 'empty-module.js');

// Stub modules that either:
//  a) contain Hermes-incompatible dynamic import(), or
//  b) are Node.js built-ins / server-only libs not available in React Native
config.resolver.extraNodeModules = {
  // ── OpenTelemetry (optional Supabase tracing deps) ──────────────────────
  '@opentelemetry/api': EMPTY_MODULE,
  '@opentelemetry/core': EMPTY_MODULE,
  '@opentelemetry/semantic-conventions': EMPTY_MODULE,
  '@opentelemetry/instrumentation': EMPTY_MODULE,
  '@opentelemetry/sdk-trace-base': EMPTY_MODULE,
  '@opentelemetry/sdk-trace-web': EMPTY_MODULE,
  '@opentelemetry/sdk-node': EMPTY_MODULE,
  '@opentelemetry/resources': EMPTY_MODULE,

  // ── Node.js built-ins used by realtime-js → ws ───────────────────────────
  // React Native has a native WebSocket; ws is not needed.
  'ws': EMPTY_MODULE,
  'stream': require.resolve('stream-browserify'),
  'events': require.resolve('events'),
};

module.exports = config;
