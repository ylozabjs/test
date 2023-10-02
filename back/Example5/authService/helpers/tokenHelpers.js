import jwt from "jsonwebtoken";

export const generateAccessToken = (userID) =>
  jwt.sign({ userID }, process.env.JWT_SECRET_KEY, {
    expiresIn: "1h"
  });
export const generateRefreshToken = (userID) =>
  jwt.sign({ userID }, process.env.JWT_SECRET_KEY_REFRESH, {
    expiresIn: "1h"
  });

export const authenticateToken = (authorizationHeader) => {
  if (authorizationHeader == "") return { error: "Not allowed to access. No token provided" };

  const token = authorizationHeader.split(" ")[1];

  try {
    const userId = jwt.verify(token, process.env.JWT_SECRET_KEY).userID;
    return { success: true, userId };
  } catch (error) {
    return { success: false, error: `Not allowed to access. ${error}` };
  }
};

export const updateAccessToken = (refreshToken) => (req, res) => {
  if (refreshToken == null) res.status(401);
  jwt.verify(refreshToken, process.env.JWT_SECRET_KEY_REFRESH, (err, user) => {
    if (err) res.status(403).json({ error: err });
    delete user.exp;
    delete user.iat;
    const newToken = generateAccessToken(user);
    res.json({
      user,
      newToken
    });
  });
};
