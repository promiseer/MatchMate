const jwt = require("jsonwebtoken");
const isAuth = (req, res, next) => {
  if (req.headers && req.headers.authorization) {
    let token = req.headers.authorization.split("Bearer ")[1];
    let decoded = jwt.verify(token, "testjsonwebtoken");
    if (!decoded) {
      res.status(401).send("token not found or expired!!");
    }
    req.currentUser = decoded;
    next();
  } else {
    res.status(401).send("You are not authorized!!");
  }
  //   };
};
module.exports = isAuth;
