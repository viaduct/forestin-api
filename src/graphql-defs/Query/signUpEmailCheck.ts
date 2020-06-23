import {Context} from "../../lib/Context";
import {EmailState, signUpEmailCheck} from "../../lib/login";

export const name = "signUpEmailCheck";

interface Params
{
    email: string;
}

export async function handler(parent: any, args: Params, context: Context): Promise<EmailState>
{
    return await signUpEmailCheck(context.db, args.email);
}
