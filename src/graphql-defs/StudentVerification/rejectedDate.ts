import {Context} from "../../lib/Context";
import {studentVerificationRejectedDate,} from "../../lib/db";

export const name = "rejectedDate";

interface Params
{
}

export async function handler(parent: any, args: Params, context: Context): Promise<Date | null>
{
    return studentVerificationRejectedDate(context.db, parent.id);
}
