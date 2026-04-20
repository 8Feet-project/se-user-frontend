export function createLogger(scope = 'worker') {
  function log(level, message, payload) {
    const parts = [new Date().toISOString(), '[' + scope + ']', level.toUpperCase(), message];
    if (payload !== undefined) {
      console.log(parts.join(' '), payload);
      return;
    }

    console.log(parts.join(' '));
  }

  return {
    info(message, payload) {
      log('info', message, payload);
    },
    warn(message, payload) {
      log('warn', message, payload);
    },
    error(message, payload) {
      log('error', message, payload);
    },
  };
}
