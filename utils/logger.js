const { NODE_ENV } = process.env;

const DEBUG = NODE_ENV === 'development';

export const log = (status, color, data) => {
  if (DEBUG) {
    console.log(`%c ${status}`, `color: ${color}; font-weight:bold;`, data);
  }
}