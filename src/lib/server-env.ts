/** Ambiente exclusivo do servidor (Workers / Node). Nunca exponha estes valores ao cliente. */
export type MetricsApiEnv = {
  apiBaseUrl: string | undefined;
  metricsApiKey: string | undefined;
};

export type TwoAvendasServerEnv = MetricsApiEnv;
export type WagooServerEnv = MetricsApiEnv;

function readEnvPair(
  keys: { url: string; key: string },
  cfEnv?: Record<string, string | undefined>,
): MetricsApiEnv {
  const fromProcess =
    typeof process !== "undefined" && process.env
      ? {
          apiBaseUrl: process.env[keys.url],
          metricsApiKey: process.env[keys.key],
        }
      : { apiBaseUrl: undefined, metricsApiKey: undefined };

  return {
    apiBaseUrl: cfEnv?.[keys.url] ?? fromProcess.apiBaseUrl,
    metricsApiKey: cfEnv?.[keys.key] ?? fromProcess.metricsApiKey,
  };
}

export function getWagooServerEnv(): WagooServerEnv {
  const g = globalThis as typeof globalThis & {
    cloudflare?: { env?: Record<string, string | undefined> };
  };
  return readEnvPair(
    { url: "WAGOO_API_BASE_URL", key: "WAGOO_METRICS_API_KEY" },
    g.cloudflare?.env,
  );
}

export function getTwoAvendasServerEnv(): TwoAvendasServerEnv {
  const g = globalThis as typeof globalThis & {
    cloudflare?: { env?: Record<string, string | undefined> };
  };
  return readEnvPair(
    { url: "TWO_AVENDAS_API_BASE_URL", key: "TWO_AVENDAS_METRICS_API_KEY" },
    g.cloudflare?.env,
  );
}
