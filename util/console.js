const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
};

const label = (tag, bg, fg) => `${fg}${bg} ${tag} ${colors.reset}`;

export default {
  ready(msg) {
    console.log(`${label('READY', colors.bgGreen, colors.white)} ${msg}`);
  },
  error(msg, err) {
    console.error(`${label('ERROR', colors.bgRed, colors.white)} ${msg}`, err || '');
  },
  warn(msg) {
    console.warn(`${label('WARN', colors.bgYellow, colors.black)} ${msg}`);
  },
  info(msg) {
    console.log(`${label('INFO', colors.bgBlue, colors.white)} ${msg}`);
  },
  load(msg) {
    console.log(`${label('LOAD', colors.bgCyan, colors.black)} ${msg}`);
  },
  success(msg) {
    console.log(`${label('OK', colors.bgGreen, colors.white)} ${msg}`);
  },
  slash(msg) {
    console.log(`${label('SLASH', colors.bgMagenta, colors.white)} ${msg}`);
  },
  music(msg) {
    console.log(`${label('MUSIC', colors.bgBlue, colors.white)} ${msg}`);
  },
  dash(msg) {
    console.log(`${label('DASH', colors.bgMagenta, colors.black)} ${msg}`);
  },
};
