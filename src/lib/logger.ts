// Centralized logging utility
// In production, this could send logs to an external service (Sentry, LogRocket, etc.)

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
    level: LogLevel;
    message: string;
    timestamp: string;
    data?: unknown;
}

const isProduction = import.meta.env.PROD;

function formatLog(level: LogLevel, message: string, data?: unknown): LogEntry {
    return {
        level,
        message,
        timestamp: new Date().toISOString(),
        data,
    };
}

function sendToExternalService(entry: LogEntry): void {
    // TODO: Integrate with external logging service like Sentry
    // Example: Sentry.captureMessage(entry.message, { level: entry.level, extra: entry.data });

    // For now, in production we just suppress console logs
    // but you could send to an API endpoint here
}

export const logger = {
    debug(message: string, data?: unknown): void {
        const entry = formatLog('debug', message, data);
        if (!isProduction) {
            console.debug(`[DEBUG] ${message}`, data ?? '');
        }
    },

    info(message: string, data?: unknown): void {
        const entry = formatLog('info', message, data);
        if (!isProduction) {
            console.info(`[INFO] ${message}`, data ?? '');
        }
    },

    warn(message: string, data?: unknown): void {
        const entry = formatLog('warn', message, data);
        if (!isProduction) {
            console.warn(`[WARN] ${message}`, data ?? '');
        } else {
            sendToExternalService(entry);
        }
    },

    error(message: string, data?: unknown): void {
        const entry = formatLog('error', message, data);
        if (!isProduction) {
            console.error(`[ERROR] ${message}`, data ?? '');
        } else {
            sendToExternalService(entry);
        }
    },
};

export default logger;
