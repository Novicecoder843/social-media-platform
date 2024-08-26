import { User } from "../modules/user/user.model";

const jwt = require('jsonwebtoken');
const {JWT_SECRET} = process.env;
console.log(JWT_SECRET,'JWT_SECRET')

const auth_middleware = async (req:any) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1]; // Remove "Bearer " from the string

        try {
            const decoded = await jwt.verify(token, JWT_SECRET);
            req.userId = decoded.userId;
        } catch (err) {
            console.error('Token verification failed:', err);
            throw new Error('Invalid/Expired token');
        }
    } else {
        throw new Error('Authorization header is required');
    }
};

export default auth_middleware;
