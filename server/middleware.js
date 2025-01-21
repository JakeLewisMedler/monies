const verifyToken = async (req, res, next) => {
  try {
    if (!req.token) throw "no token";
    req.auth = await admin.auth().verifyIdToken(req.token);
    if (!req.auth) throw "no auth user found";

    next();
  } catch (error) {
    return res.status(401).send(error);
  }
};

module.exports = { verifyToken };
