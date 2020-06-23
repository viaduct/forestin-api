import {Context} from "../../lib/Context";
import {refreshToken} from "../../lib/login";


export const name = "refreshSignInToken";

interface Params
{
    token: string
}

export async function handler(parent: any, args: Params, context: Context): Promise<string>
{
    return await refreshToken(context.db, args.token);
}
