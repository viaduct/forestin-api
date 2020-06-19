import {Context} from "../../lib/Context";
import {CollectionKind, prop, studentVerificationProps, StudentVerificationState} from "../../lib/db";

export const name = "state";

interface Params
{
}

export async function handler(parent: any, args: Params, context: Context): Promise<StudentVerificationState>
{
    return await prop(
        context.db,
        CollectionKind.StudentVerification,
        parent.id,
        "state",
    );
}
