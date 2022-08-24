function errorHandler(err, req, res, next) {
  //jwt authorized error
  if (err.name === "UnauthorizedError") {
    return res.status(401).json({ message: "The user is not authorizer" });
  }
  //Valition error
  if (err.name === "ValidationError") {
    return res.status(401).json({ message: err });
  }
  //Default error
  return res.status(500).json(err);
}

module.exports = errorHandler;
