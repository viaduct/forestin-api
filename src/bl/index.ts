import {Context} from "../context";
import mongo from "mongodb";
import {create, update} from "../failsafe";
import {CollecKind} from "../enums";
import {StudentVerificationState} from "../enums/StudentVerificationState";

export async function signUp(c: Context, userData: any): Promise<mongo.ObjectId>
{
    // Create user.
    const newUserId = new mongo.ObjectId();
    const now = new Date(Date.now()); // todo now declaration. Add this to the context.
    await create(
        c,
        CollecKind.User,
        {
            ...userData,
            _id: newUserId,
            issuedDate: now,
        },
    );

    return newUserId;
}

export async function updateUser(c: Context, id: mongo.ObjectId, userData: any)
{
    // Update user.
    await update(
        c,
        CollecKind.User,
        id,
        userData,
    );
}

export async function createStudentVerification(c: Context, svData: any): Promise<mongo.ObjectId>
{
    // Create StudentVerification.
    const newSvId = new mongo.ObjectId();
    const now = new Date(Date.now()); // todo now declaration.
    await create(
        c,
        CollecKind.StudentVerification,
        {
            ...svData,

            _id: newSvId,
            issuedDate: now,

            state: StudentVerificationState.Pended,
        },
    );

    return newSvId;
}

export async function fixStudentVerification(c: Context, svId: mongo.ObjectId, isConfirmed: boolean)
{
    const find = {_id: svId};
    const update = {$set: {
        state: isConfirmed?
            StudentVerificationState.Confirmed:
            StudentVerificationState.Rejected
    }};
    await c.mongo.collec(CollecKind.StudentVerification).updateOne(find, update);
}

export async function findUserByEmailPassword(
    c: Context,
    email: string,
    password: string,
): Promise<mongo.ObjectId>
{
    const theUser = await c.mongo.collec(CollecKind.User).findOne(
        {
            email: email,
            password: password,
        },
        {
            _id: 1,
        }
    );

    if ( theUser )
    {
        return theUser._id;
    }
    else
    {
        throw 0; // todo
    }
}
