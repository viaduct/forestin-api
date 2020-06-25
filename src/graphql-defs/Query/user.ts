import {Context} from "../../lib/Context";
import {mongoIdOrNull, userIdOrAuth} from "../../lib/login";
import mongo from "mongodb";

export const name = "user";

interface Params
{
    userId?: string;
}

export async function handler(parent: any, args: Params, context: Context): Promise<any>
{
    const userId = await userIdOrAuth(mongoIdOrNull(args.userId), context.user);

    const result = {id: userId.valueOf()};
    return result;
}
