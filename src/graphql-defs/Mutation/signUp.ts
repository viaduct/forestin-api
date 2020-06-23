import {Context} from "../../lib/Context";
import {signUp} from "../../lib/login";

export const name = "signUp";

interface Params
{
    email: string;
    password: string;
    passFormId: string;
}

export async function handler(parent: any, args: Params, context: Context): Promise<null>
{
    await signUp(context.db, args.email, args.password, args.passFormId);
    return null;
}
