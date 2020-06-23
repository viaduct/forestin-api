import {Context} from "../../lib/Context";
import {signIn} from "../../lib/login";


export const name = "signIn";

interface Params
{
    id: string;
    password: string;
}

export async function handler(parent: any, args: Params, context: Context): Promise<string>
{
    return await signIn(context.db, args.id, args.password);
}
