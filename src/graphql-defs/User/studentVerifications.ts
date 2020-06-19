import {Context} from "../../lib/Context";
import {CollectionKind, prop, userProps} from "../../lib/db";
import mongo from "mongodb";

export const name = "studentVerifications";

interface Params
{
}

export async function handler(parent: any, args: Params, context: Context): Promise<any[]>
{
    // Prepare studentVerification ids.
    const verifIds = await prop(
        context.db,
        CollectionKind.User,
        parent.id,
        "studentVerifications",
    );

    // id => {id: asdf}
    return verifIds.map((oneVerif: mongo.ObjectId)=>{
        return {
            id: oneVerif.valueOf(),
        };
    });
}
