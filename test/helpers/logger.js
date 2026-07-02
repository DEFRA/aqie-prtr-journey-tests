import pino from 'pino'

function createLogger() {
  return pino({
    level: 'info'
  })
}

export default createLogger
