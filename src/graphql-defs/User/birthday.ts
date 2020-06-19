import {Context} from "../../lib/Context";
import {CollectionKind, prop} from "../../lib/db";

export const name = "birthday";

interface Params
{
}

export async function handler(parent: any, args: Params, context: Context): Promise<string>
{
    // Birthday is a string, not a date, in the form of yyyy-mm-dd. No timezone considered.
    return await prop(
        context.db,
        CollectionKind.User,
        parent.id,
        "birthday",
    );
}
