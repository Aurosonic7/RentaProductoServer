import logger from '../utils/logger.js';

const errorHandler = (err, req, res) => {
  const status = err.status || 500;
  const errorMessageMap = {
    400: 'Bad Request',
    401: 'Not Authorized',
    403: 'Forbidden',
    404: 'Not Found Page',
    405: 'Method Not Allowed',
    408: 'Request Timeout',
    409: 'Conflict',
    413: 'Payload Too Large',
    415: 'Unsupported Media Type',
    429: 'Too Many Requests',
    500: 'Something broke!',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
    504: 'Gateway Timeout',
  };

  const message = errorMessageMap[status] || 'Unknown Error';
  
  if (status >= 400 && status < 500) logger.warn(`Client error: ${message} - ${status}`, { error: err.stack, path: req.path, method: req.method });
  else if (status >= 500) logger.error(`Server error: ${message} - ${status}`, { error: err.stack, path: req.path, method: req.method });
  
  res.status(status).send({ status, message, error: err.message });
};

const notFoundHandler = (req, res) => {
  res.status(404).send({ status: 404, message: 'Not Found Page' });
};

export { errorHandler, notFoundHandler };
