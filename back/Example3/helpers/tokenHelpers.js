import jwt from 'jsonwebtoken';

export const generateAccessToken = (user) => jwt.sign(user, process.env.JWT_SECRET_KEY, {
    expiresIn: '15s',
});
export const generateRefreshToken = (user) => jwt.sign(user, process.env.JWT_SECRET_KEY_REFRESH, {
    expiresIn: '1h',
});

export const authenticateToken = (secretKey) => (req, res) => {
    const { headers } = req;
    const authHeader = headers.authorization;
    const token = authHeader.split(' ')[1];
    if (token == null) res.status(401);
    jwt.verify(token, secretKey, (err, user) => {
        if (err) res.status(403).json({ error: err });
        delete user.exp;
        delete user.iat;
        res.json(user);
    });
};

export const updateAccessToken = (req, res) => {
    const { headers } = req;
    const authHeader = headers.authorization;
    const refreshToken = authHeader.split(' ')[1];
    if (refreshToken == null) res.status(401);
    jwt.verify(refreshToken, process.env.JWT_SECRET_KEY_REFRESH, (err, user) => {
        if (err) res.status(403).json({ error: err });
        delete user.exp;
        delete user.iat;
        const newToken = generateAccessToken(user);
        res.json({
            user,
            newToken,
        });
    });
};
