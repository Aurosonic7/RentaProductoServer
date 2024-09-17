class CustomError extends Error {
  constructor(message, errorCode, statusCode = 500, details = {}) {
    super(message);
    this.name = this.constructor.name;
    this.errorCode = errorCode;
    this.statusCode = statusCode;  //! Código de estado HTTP opcional
    this.details = details;  //! Información adicional sobre el error
    //! Captura de la pila de errores si no se ha capturado ya
    if (Error.captureStackTrace) 
      Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      errorCode: this.errorCode,
      statusCode: this.statusCode,
      details: this.details,
    };
  }
}

export default CustomError;