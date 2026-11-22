export class IntegrationDisabledError extends Error {
  constructor(integration: string) {
    super(`Integracja ${integration} jest WYŁĄCZONA w F1 (wymaga osobnej zgody właściciela i konfiguracji sekretów).`);
    this.name = "IntegrationDisabledError";
  }
}

export type MetaErrorClass = "retryable" | "permanent" | "auth" | "timeout";

export class MetaApiError extends Error {
  constructor(public code: string, public errorClass: MetaErrorClass, message: string) {
    super(message);
    this.name = "MetaApiError";
  }
}

export function liveFlag(name: "META" | "GSC" | "GA4"): boolean {
  return process.env[`ZOO24_${name}_LIVE`] === "true";
}
