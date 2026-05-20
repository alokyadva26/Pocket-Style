// metro.config.js
// =============================================================================
// PocketStylist — Metro Bundler Configuration
// =============================================================================
//
// Key fix: @supabase/supabase-js optionally imports OpenTelemetry packages
// using a dynamic import() that Hermes cannot compile in production builds.
// We stub those packages out to empty objects so the dynamic import never
// makes it into the bundle.

const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Resolve OpenTelemetry optional peer dependencies to empty stubs so that
// Hermes does not encounter unsupported dynamic import() expressions.
config.resolver.resolveRequest = (context, moduleName, platform) => {
  const OTEL_STUBS = [
    '@opentelemetry/api',
    '@opentelemetry/core',
    '@opentelemetry/semantic-conventions',
    '@opentelemetry/instrumentation',
    '@opentelemetry/sdk-trace-base',
    '@opentelemetry/sdk-trace-web',
  ];

  if (OTEL_STUBS.some((pkg) => moduleName === pkg || moduleName.startsWith(pkg + '/'))) {
    // Return an empty module — the optional tracing code inside supabase
    // gracefully falls back when these are not present.
    return {
      type: 'empty',
    };
  }

  // Default resolution for everything else
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
