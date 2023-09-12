global.successResponse = (statusCode, data, message) => {
  return {
    data: data,
    isError: false,
    message: message ? message : "",
    status: statusCode ? statusCode : 200,
  };
};
global.errorResponse = (statusCode, message, data = null) => {
  return {
    data: data,
    status: statusCode || 500,
    isError: true,
    message: message || "Internal server error",
  };
};
global.errorBody = (method, url, message) => {
  return `${method} ${url} - ${message}`;
};

module.exports = { successResponse, errorResponse, errorBody };
