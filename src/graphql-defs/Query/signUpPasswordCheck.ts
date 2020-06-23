import {Context} from "../../lib/Context";
import {PasswordState, signUpPasswordCheck} from "../../lib/login";

export const name = "signUpPasswordCheck";

interface Params
{
    password: string;
}

export async function handler(parent: any, args: Params, context: Context): Promise<PasswordState>
{
    return signUpPasswordCheck(args.password);
}
