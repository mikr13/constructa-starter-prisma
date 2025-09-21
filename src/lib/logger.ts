// logger.ts
// import { serverEnvSchema } from '~/env';
// import { collectRuntimeEnv } from '~/env/runtime-values';
import { redact, redactDeep } from '~/lib/security/token-redaction';
type Level = 'verbose' | 'debug' | 'info' | 'warn' | 'error';

// Get LOG_LEVEL from validated environment, default to 'debug' for development
// const logLevelSchema = serverEnvSchema.pick({ LOG_LEVEL: true }).partial();

const resolvedLogLevel = (() => {
  return 'debug';
  // const parsed = logLevelSchema.safeParse(collectRuntimeEnv());
  // return parsed.success ? parsed.data.LOG_LEVEL : undefined;
})();

const LOG_LEVEL =
  resolvedLogLevel ||
  (typeof globalThis !== 'undefined' &&
    (globalThis as typeof globalThis & { LOG_LEVEL?: string }).LOG_LEVEL) ||
  'debug'; // Changed default to 'debug' to see all logs

const LOG_LEVELS: Record<Level, number> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
  verbose: 4,
};

const shouldLog = (level: Level): boolean => {
  return LOG_LEVELS[level] <= LOG_LEVELS[LOG_LEVEL as Level];
};

/**
 * Create a condensed log entry
 * @param level - Log level
 * @param msg - Log message
 * @param meta - Metadata
 */
function createCondensedLog(level: Level, msg: string, meta: Record<string, unknown> = {}) {
  // For DEBUG level with condensed format, extract key information
  if (LOG_LEVEL === 'debug') {
    // Extract key information from meta
    const condensedMeta: Record<string, unknown> = {};

    // Extract request information if present
    if (meta.requestId) {
      condensedMeta.requestId = meta.requestId;
    }

    if (meta.url) {
      condensedMeta.url = meta.url;
    }

    if (meta.method) {
      condensedMeta.method = meta.method;
    }

    if (meta.jobId) condensedMeta.jobId = meta.jobId;
    if ('projectId' in meta && meta.projectId !== undefined)
      condensedMeta.projectId = meta.projectId;
    if ('repo' in meta && meta.repo !== undefined) condensedMeta.repo = meta.repo;
    if ('id' in meta && meta.id !== undefined) condensedMeta.id = meta.id;
    if ('storageMode' in meta && meta.storageMode !== undefined)
      condensedMeta.storageMode = meta.storageMode;

    if (meta.phase) condensedMeta.phase = meta.phase;

    if (meta.status) condensedMeta.status = meta.status;

    // Add any error information
    if (meta.error) {
      condensedMeta.error = meta.error;
    }

    return {
      level,
      msg: redact(String(msg || '')),
      timestamp: new Date().toISOString(),
      ...redactDeep(condensedMeta),
    };
  }

  // For non-debug levels (including 'verbose'), include all metadata
  return {
    level,
    msg: redact(String(msg || '')),
    timestamp: new Date().toISOString(),
    ...redactDeep(meta),
  };
}

/**
 * Core logging function
 * @param level - Log level (debug, info, warn, error)
 * @param msg - Log message
 * @param meta - Additional metadata to include in the log
 */
function log(level: Level, msg: string, meta: Record<string, unknown> = {}) {
  // Skip logging if level is below configured level
  if (!shouldLog(level)) {
    return;
  }

  const entry = createCondensedLog(level, msg, meta);

  const consoleMethod =
    level === 'error' ? 'error' : level === 'warn' ? 'warn' : level === 'info' ? 'info' : 'log';
  console[consoleMethod](entry);
}

// Convenience methods for each log level
export const logger = {
  verbose: (msg: string, meta?: Record<string, unknown>) => log('verbose', msg, meta),
  debug: (msg: string, meta?: Record<string, unknown>) => log('debug', msg, meta),
  info: (msg: string, meta?: Record<string, unknown>) => log('info', msg, meta),
  warn: (msg: string, meta?: Record<string, unknown>) => log('warn', msg, meta),
  error: (msg: string, meta?: Record<string, unknown>) => log('error', msg, meta),
};
