import {Context} from "../../lib/Context";
import mongo from "mongodb";
import {CollectionKind, prop, studentVerificationProps} from "../../lib/db";

export const name = "majors";

interface Params
{
}

export async function handler(parent: any, args: Params, context: Context): Promise<string[]>
{
    const majors: mongo.ObjectId[] = await prop(
        context.db,
        CollectionKind.StudentVerification,
        parent.id,
        "majors",
    );

    return majors.map((item: mongo.ObjectId)=>item.valueOf() as string);
}
