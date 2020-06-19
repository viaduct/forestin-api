import {Context} from "../../lib/Context";
import {CollectionKind, prop, userProps} from "../../lib/db";

export const name = "phoneNumber";

interface Params
{
}

export async function handler(parent: any, args: Params, context: Context): Promise<string>
{
    // Example. 01012341234
    // See, no hypen, etc.
    // If the phone number is foreign, use the following format, "+82 1012341234".
    return await prop(
        context.db,
        CollectionKind.User,
        parent.id,
        "phoneNumber",
    );
}
