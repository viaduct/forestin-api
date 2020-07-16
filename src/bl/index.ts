import {Context} from "../context";
import mongo from "mongodb";
import {create} from "../failsafe";
import {CollecKind} from "../enums";

export async function signUp(c: Context, args: any): Promise<mongo.ObjectId>
{
    // Create user.
    const newUserId = new mongo.ObjectId();
    const now = new Date(Date.now()); // todo now declaration. Add this to the context.
    await create(
        c,
        CollecKind.User,
        {
            ...args,
            _id: newUserId,
            issuedDate: now,
        },
    );

    return newUserId;
}

