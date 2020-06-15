const appRoot = require('app-root-path');
const Sentry = require('winston-sentry-raven-transport');

const winston = require('winston');
const { format } = require('winston');

const util = require('util');

const {
  combine, timestamp, label, printf,
} = format;

const MAX_FILE_SIZE = 104857600; // 100 MB;
const MAX_FILES = 30;

const LOGGER__API = 'api';
const LOGGER_CONSUMER = 'consumer';
const LOGGER_WORKER = 'worker';
const LOGGER_AUTH_CALLBACK = 'auth-callback';

const LOGGERS_ALL: string[] = [
  LOGGER__API,
  LOGGER_CONSUMER,
  LOGGER_WORKER,
  LOGGER_AUTH_CALLBACK,
];

const myFormat = printf((info: any) => {
  // eslint-disable-next-line unicorn/prevent-abbreviations
  const nodeEnv: string = process.env.NODE_ENV || 'not-determined';
  const service = info.service || `${info.label}-service`;
  const basic: string = `${info.timestamp}.[${nodeEnv}].[${info.label}].[${service}].[${info.level}]: ${JSON.stringify(info.message)}`;

  if (info.level === 'error') {
    const full: string = util.inspect(info, false, 5, false);
    return `${basic}. Full: ${full}`;
  }

  return basic;
});

const options = {
  file_error: {
    level: 'error',
    filename: `${appRoot}/logs/app_error.log`,
    json: false,
    maxsize: MAX_FILE_SIZE,
    maxFiles: MAX_FILES,
    colorize: false,
  },
  file_combined: {
    level: 'info',
    filename: `${appRoot}/logs/app_combined.log`,
    json: false,
    maxsize: MAX_FILE_SIZE,
    maxFiles: MAX_FILES,
    colorize: false,
  },
  test_console: {
    level: 'error',
    // handleExceptions: true,
    json: false,
    colorize: true,
  },
  sentry: {
    dsn: 'http://32db371651644b0da6d582d2c71d05c3@sentry.ucommunity.io/1',
    level: 'error',
  },
};

// noinspection JSValidateTypes
const transports = [
  new winston.transports.File(options.file_error),
  new winston.transports.File(options.file_combined),
];

if (process.env.NODE_ENV === 'production') {
  transports.push(
    new Sentry(options.sentry),
  );
}

function getFormat(labelToSet) {
  return combine(
    label({ label: labelToSet }),
    timestamp(),
    myFormat,
  );
}

const loggersLength = LOGGERS_ALL.length;
for (let i = 0; i < loggersLength; i += 1) {
  // eslint-disable-next-line security/detect-object-injection
  const loggerName = LOGGERS_ALL[i];

  winston.loggers.add(loggerName, {
    format: getFormat(loggerName),
    transports,
  });

  if (process.env.NODE_ENV === 'test') {
    winston.loggers.get(loggerName).add(new winston.transports.Console(options.test_console));
  }
}

const ApiLoggerStream = {
  write(message) {
    winston.loggers.get(LOGGER__API).info(message);
  },
};

const ApiLogger = winston.loggers.get(LOGGER__API);
const ConsumerLogger = winston.loggers.get(LOGGER_CONSUMER);
const WorkerLogger = winston.loggers.get(LOGGER_WORKER);
const AuthCallbackLogger = winston.loggers.get(LOGGER_AUTH_CALLBACK);

export {
  ApiLogger,
  ConsumerLogger,
  WorkerLogger,

  ApiLoggerStream,
  AuthCallbackLogger,
};
