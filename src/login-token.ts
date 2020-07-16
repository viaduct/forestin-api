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

export function refreshToken(
    c: Context,
    prevToken: Token,
): Token
{
    // Parse the token.
    const prevData = jwt.verify(prevToken, c.auth.privateKey);

    // Recreate the token.
    const newToken = jwt.sign(
        prevData,
        c.auth.privateKey
    );

    return newToken;
}
