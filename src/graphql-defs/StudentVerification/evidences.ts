import {Context} from "../../lib/Context";
import {prop, CollectionKind} from "../../lib/db";

export const name = "evidences";

interface Params
{
}

export async function handler(parent: any, args: Params, context: Context): Promise<string[]>
{
    return await prop(
        context.db,
        CollectionKind.StudentVerification,
        parent.id,
        "evidences",
    );
}
