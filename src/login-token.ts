import jwt from "jsonwebtoken";
import mongo from "mongodb";
import {Context} from "./context";
import {findUserByEmailPassword} from "./bl";

export type Token = string;

export async function createTokenFromEmailPassword(
    c: Context,
    email: string,
    password: string,
): Promise<Token>
{
    // Find the user.
    const theUserId = await findUserByEmailPassword(c, email, password);
    return createToken(c, theUserId, email, password);
}

export function createToken(
    c: Context,
    id: mongo.ObjectId,
    email: string,
    password: string,
): Token
{
    console.log(c.auth);
    const data = {
        id: id.toString(),
        email: email,
        password: password,
    };
    const token = jwt.sign(
        data,
        c.auth.privateKey,
        {expiresIn: c.auth.tokenLifetime},
    );
    return token;
}

export function parseToken(
    privateKey: string,
    token: string,
): {
    id: mongo.ObjectId,
    email: string,
    password: string,
}
{
    const data: any = jwt.verify(token, privateKey);
    return {
        id: new mongo.ObjectId(data.id),
        email: data.email,
        password: data.password,
    };
}

export async function refreshToken(
    c: Context,
    prevToken: Token,
): Promise<Token>
{
    // Parse the token.
    const prevData: any = jwt.verify(prevToken, c.auth.privateKey);

    // Regenerate token.
    console.assert("email" in prevData, prevData);
    console.assert("password" in prevData, prevData);
    const newToken = await createTokenFromEmailPassword(c, prevData.email, prevData.password);

    // Recreate the token.
    // const newToken = jwt.sign(
    //     prevData,
    //     c.auth.privateKey
    // );

    return newToken;
}
