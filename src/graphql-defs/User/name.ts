import {Context} from "../../lib/Context";
import {CollectionKind, prop, userProps} from "../../lib/db";

export const name = "name";

interface Params
{
}

export async function handler(parent: any, args: Params, context: Context): Promise<string>
{
    return await prop(
        context.db,
        CollectionKind.User,
        parent.id,
        "name",
    );
}
