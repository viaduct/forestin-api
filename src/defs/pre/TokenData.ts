import mongo from "mongodb";
import jwt from "jsonwebtoken";

export interface TokenData {
    id: mongo.ObjectId,
    password: string,
    email: string,
}

export async function tokenData(privateKey: string, token: string): Promise<TokenData> {
    const {email, password, id} = jwt.verify(token, privateKey) as any;

    const mongoUserId = new mongo.ObjectId(id);

    return {
        id: mongoUserId,
        email: email,
        password: password,
    };
}
