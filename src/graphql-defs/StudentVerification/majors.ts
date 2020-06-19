import {Context} from "../../lib/Context";
import mongo from "mongodb";
import {CollectionKind, prop, studentVerificationProps} from "../../lib/db";

export const name = "majors";

interface Params
{
}

export async function handler(parent: any, args: Params, context: Context): Promise<mongo.ObjectId[]>
{
    return await prop(
        context.db,
        CollectionKind.StudentVerification,
        parent.id,
        "majors",
    );
}
