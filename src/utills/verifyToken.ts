import jwt from 'jsonwebtoken'
import { User } from '../modules/user/user.model';

const secretKey: any = process.env.JWT_SECRET
console.log(secretKey, "secretkey verify")

const verifyToken = async (token: any) => {
    const decoded: any = await jwt.verify(token, secretKey);

    return decoded

    // if(decoded){
    //     const validUser = await User.findOne({ email: decoded.email});
    //     if(validUser){
    //         return 'Valid'
    //     } else {{
    //         return 'Invalid'
    //     }}
    // }

}

export default verifyToken