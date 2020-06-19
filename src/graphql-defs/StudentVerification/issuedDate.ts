import {Context} from "../../lib/Context";
import {CollectionKind, prop, studentVerificationProps} from "../../lib/db";

export const name = "issuedDate";

interface Params
{
}

export async function handler(parent: any, args: Params, context: Context): Promise<Date>
{
    return await prop(
        context.db,
        CollectionKind.StudentVerification,
        parent.id,
        "issuedDate",
    );
}
