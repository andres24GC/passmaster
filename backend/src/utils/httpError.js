// Error con código HTTP; lo interpreta el middleware errorHandler.
module.exports = (status, message) => Object.assign(new Error(message), { status });
