import {Context} from "../context";
import mongo from "mongodb";
import {create, update} from "../failsafe";
import {CollecKind} from "../enums";
import {StudentVerificationState} from "../enums/StudentVerificationState";
import {GroupMemberKind} from "../enums/GroupMemberKind";
import {emptyWrap} from "../gql/resolvers/util";
import {Gender} from "../enums/Gender";
import * as fs from "../failsafe2";

export async function signUp(
    c: Context,
    a: {
        email: string,
        password: string,
        name: string,
        birthday: string,
        gender: Gender,
        phoneNumber: string,
    }
): Promise<{id: mongo.ObjectId}>
{
    // Create user.
    const newUserId = new mongo.ObjectId();
    const now = new Date(Date.now()); // todo now declaration. Add this to the context.
    await fs.createUser(
        c,
        {
            _id: newUserId,
            issuedDate: now,
            email: a.email,
            password: a.password,
            name: a.name,
            birthday: a.birthday,
            gender: a.gender,
            phoneNumber: a.phoneNumber,
        },
    );

    return {id: newUserId};
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

export async function createGroup(
    c: Context,
    groupData: any
): Promise<mongo.ObjectId>
{
    // Create group.
    const newGroupId = new mongo.ObjectId();
    const now = new Date(Date.now()); // todo now declaration. Add this to the context.
    await create(
        c,
        CollecKind.Group,
        {
            ...groupData,
            _id: newGroupId,
            issuedDate: now,
        },
    );

    return newGroupId;
}

export async function updateGroup(
    c: Context,
    id: mongo.ObjectId,
    groupData: any,
)
{
    await update(
        c,
        CollecKind.Group,
        id,
        groupData,
    );
}

export async function applyGroup(
    c: Context,
    groupId: mongo.ObjectId,
    userId: mongo.ObjectId,
)
{
    // Can apply to the group when GroupMemberKind is NotMember.
    const memberKind = await groupMemberKind(
        c,
        groupId,
        userId,
    );
    if ( memberKind == GroupMemberKind.NotMember )
    {
        const newMemberId = new mongo.ObjectId();
        await c.mongo.collec(CollecKind.GroupMember).insertOne({
            _id: newMemberId,
            group: groupId,
            user: userId,
            kind: GroupMemberKind.Applicant,
        });
    }
    else
    {
        throw new Error(""); // todo there may be better error format.
    }
}

export async function leaveGroup(
    c: Context,
    groupId: mongo.ObjectId,
    userId: mongo.ObjectId,
)
{
    // Only Applicant, Manager, and Normal members can leave.
    const memberKind = await groupMemberKind(c, groupId, userId);
    switch ( memberKind )
    {
        case GroupMemberKind.Applicant:
        case GroupMemberKind.Manager:
        case GroupMemberKind.Normal:
        {
            await c.mongo.collec(CollecKind.GroupMember).deleteOne({group: groupId, user: userId});
            break;
        }
        default:
            throw new Error(""); // todo there can be a better error format.
    }
}

export async function updateMember(
    c: Context,
    groupId: mongo.ObjectId,
    userId: mongo.ObjectId,
    newMemberKind: GroupMemberKind,
)
{
    // Only newKind of Manager, Normal can be possible.
    if (
        newMemberKind == GroupMemberKind.Normal ||
        newMemberKind == GroupMemberKind.Manager
    )
    {
        // Only prevKind of Applicant, Manager, Normal can be possible.
        const memberKind = await groupMemberKind(c, groupId, userId);
        switch ( memberKind )
        {
            case GroupMemberKind.Normal:
            case GroupMemberKind.Manager:
            case GroupMemberKind.Applicant:
            {
                const find = {user: userId, group: groupId};
                const update = {$set: {kind: newMemberKind}};
                await c.mongo.collec(CollecKind.GroupMember).updateOne(find, update);
                break;
            }
            default:
                throw 0; // todo not appropriate group member kind.
        }
    }
    else
    {
        throw 0; // todo better error!
    }
}

export async function succeedGroupOwner(
    c: Context,
    groupId: mongo.ObjectId,
    newOwnerId: mongo.ObjectId,
)
{
    // Find the previous owner.
    const group = c.mongo.collec(CollecKind.Group).findOne({_id: groupId});
    if ( group != null )
    {
        // todo check whether the new owner is valid.
        // Reset group owner.
        await c.mongo.collec(CollecKind.Group).updateOne({_id: groupId}, {$set: {owner: newOwnerId}});

        // Add new member.
        // If there's already one, it will fail automatically.
        const newMemId = new mongo.ObjectId();
        await c.mongo.collec(CollecKind.GroupMember).insertOne({
            _id: newMemId,
            group: groupId,
            user: newOwnerId,
            kind: GroupMemberKind.Manager,
        });
    }
    else
    {
        throw 0; // todo place good error, there's no matching group.
    }
}

export async function groupMemberKind(
    c: Context,
    groupId: mongo.ObjectId,
    userId: mongo.ObjectId
): Promise<GroupMemberKind>
{
    // Is a valid user?
    const userCount = await c.mongo.collec(CollecKind.User).countDocument({_id: userId, isDeleted: {$not: {$eq: true}}}, {limit: 1});
    if ( userCount == 1 )
    {
        // Is a valid group?
        const groupCount = await c.mongo.collec(CollecKind.Group).countDocument({_id: groupId, isDeleted: {$not: {$eq: true}}}, {limit: 1});
        if ( groupCount == 1 )
        {
            // Is owner?
            const {owner: groupOwnerId} = await c.mongo.collec(CollecKind.Group).findOne({_id: groupId})
            if ( groupId.equals(groupOwnerId) )
            {
                return GroupMemberKind.Owner;
            }
            else
            {
                // Find member object.
                const memberFilter = {
                    group: groupId,
                    user: userId,
                };
                const member = await c.mongo.collec(CollecKind.GroupMember).findOne(memberFilter);
                if ( member != null )
                {
                    return member.kind;
                }
                else
                {
                    return GroupMemberKind.NotMember;
                }
            }
        }
        else
        {
            return GroupMemberKind.NotGroup;
        }
    }
    else
    {
        return GroupMemberKind.NotUser;
    }
}

export async function createGroupQna(
    c: Context,
    qnaData: any
): Promise<mongo.ObjectId>
{
    const id = new mongo.ObjectId();
    const now = new Date(Date.now()); // todo fixxxxxx this!
    await create(
        c,
        CollecKind.GroupQna,
        {
            author: qnaData.author,
            group: qnaData.group,
            body: qnaData.body,

            _id: id,
            issuedDate: now,
        },
    );

    return id;
}

export async function updateGroupQna(
    c: Context,
    id: mongo.ObjectId,
    qnaData: any,
)
{
    await update(
        c,
        CollecKind.GroupQna,
        id,
        {
            body: qnaData.body,
        },
    );
}

export async function answerGroupQna(
    c: Context,
    id: mongo.ObjectId,
    qnaData: any,
)
{
    await update(
        c,
        CollecKind.GroupQna,
        id,
        {
            answer: qnaData.answer,
        },
    );
}

export async function createGroupSchedule(
    c: Context,
    scheduleData: any,
): Promise<mongo.ObjectId>
{
    const id = new mongo.ObjectId();
    await create(
        c,
        CollecKind.GroupSchedule,
        {
            _id: id,
            group: scheduleData.group,
            title: scheduleData.title,
            date: scheduleData.date,
        },
    );
    return id;
}

export async function updateGroupSchedule(
    c: Context,
    id: mongo.ObjectId,
    sData: any,
)
{
    await update(
        c,
        CollecKind.GroupSchedule,
        id,
        {
            title: sData.title,
            date: sData.date,
        },
    );
}

export async function createGroupNotice(
    c: Context,
    data: any
): Promise<mongo.ObjectId>
{
    const id = new mongo.ObjectId();
    const now = new Date(Date.now());
    await create(
        c,
        CollecKind.GroupNotice,
        {
            _id: id,

            issuedDate: now,
            lastModifiedAt: now,

            group: data.group,
            author: data.author,

            isUrgent: data.isUrgent,
            title: data.title,
            body: data.body,
            files: data.files,
            images: data.images,
        },
    );
    return id;
}

export async function updateGroupNotice(
    c: Context,
    id: mongo.ObjectId,
    data: any,
)
{
    const now = new Date(Date.now());
    // todo DANGEROUS! use failsafe version later.
    const updates = [
        {
            $set: emptyWrap({
                lastModifiedAt: now,
                isUrgent: data.isUrgent,
                title: data.title,
                body: data.body,
            }),
        },
        ...(
            data.filesAdded != null ?
                data.filesAdded.map(
                    (fileAdded: string)=>({
                        $addToSet: {files: fileAdded}
                    })
                ):
                []
        ),
        ...(
            data.filesRemoved != null ?
                data.filesRemoved.map(
                    (fileRemoved: string)=>({
                        $pull: {files: fileRemoved}
                    })
                ):
                []
        ),
        ...(
            data.imagesAdded != null ?
                data.imagesAdded.map(
                    (imageAdded: string)=>({
                        $addToSet: {images: imageAdded}
                    })
                ):
                []
        ),
        ...(
            data.imagesREmoved != null ?
                data.imagesREmoved.map(
                    (imageRemoved: string)=>({
                        $pull: {images: imageRemoved}
                    })
                ):
                []
        ),
    ];

    await Promise.all(updates.map(
        (oneUpdate: any)=>c.mongo.collec(CollecKind.GroupNotice).updateOne({_id: id}, oneUpdate)
    ));
}

export async function findUserByEmailPassword(
    c: Context,
    email: string,
    password: string,
): Promise<mongo.ObjectId>
{
    const theUser = await c.mongo.collec(CollecKind.User).findOne(
        {
            isDeleted: {$not: {$eq: true}},
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
