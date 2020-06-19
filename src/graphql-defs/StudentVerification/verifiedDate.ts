import {Context} from "../../lib/Context";
import {studentVerificationVerifiedDate} from "../../lib/db";

export const name = "verifiedDate";

interface Params
{
}

export async function handler(parent: any, args: Params, context: Context): Promise<Date | null>
{
    return studentVerificationVerifiedDate(context.db, parent.id);
}
