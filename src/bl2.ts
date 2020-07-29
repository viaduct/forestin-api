import {Context} from "./context";
import * as fsl from "./failsafe2";
import mongo from "mongodb";
import {FileAllocator} from "./upload-file";
import {CollecKind} from "./enums";
import {addAsSet, ChatHostGroup, ChatHostGroupQna, ChatMsgKind, removeAsSet, VoteDecision} from "./scratch";
import {ChatHostKind} from "./enums/ChatHostKind";
import {GroupHistoryState} from "./enums/GroupHistoryState";
import * as uuid from "uuid";
import * as loginToken from "./login-token";
import {createTokenFromEmailPassword} from "./login-token";
import {findUserByEmailPassword, groupMemberKind} from "./bl";
import {StudentVerificationState} from "./enums/StudentVerificationState";
import {GroupMemberKind} from "./enums/GroupMemberKind";
import {create} from "./failsafe";

// Forall todo typecheck.

export async function createGroupHistory(
    c: Context,
    args: {
        group: mongo.ObjectId,
        author: mongo.ObjectId,
        state: GroupHistoryState,
        title: string,
        body: string,
        images: FileAllocator[],
    }
): Promise<{id: mongo.ObjectId}>
{
    // Call failsafe layer.
    // todo
    const id = new mongo.ObjectId;
    const doc = {
        _id: id,
        issuedDate: c.now.now(),
        lastModifiedAt: c.now.now(),
        group: args.group,
        author: args.author,
        state: args.state,
        title: args.title,
        body: args.body,
        images: await Promise.all(args.images.map(
            (image: FileAllocator)=>image.allocate([CollecKind.GroupHistory, id.toString(), "images"])
        )),
    };
    await fsl.createGroupHistory(c, doc);
    return {id: id};
}

export async function updateGroupHistory(c: Context, args: any): Promise<any>
{
    // todo
    // Get previous images.
    const {images} = await c.mongo.collec(CollecKind.GroupHistory).findOne({_id: args.id}, {_id: 0, images: 1});
    // Remove and add.
    const afterRemoved = removeAsSet(images, args.imagesRemoved);
    const afterAdded = [
        ...afterRemoved,
        ...await Promise.all(args.imagesAdded.map(
            (image: FileAllocator)=>image.allocate([CollecKind.GroupHistory, args.id.toString(), "images"])
        )),
    ];

    const doc = {
        _id: args.historyId,
        lastModifiedAt: c.now.now(),
        ...("state" in args) ?
            {state: args.state} :
            {},
        ...("title" in args) ?
            {title: args.title} :
            {},
        ...("body" in args) ?
            {body: args.body} :
            {},
        images: afterAdded,
    };
    await fsl.updateGroupHistory(c, doc);
}

export async function destroyGroupHistory(c: Context, args: any): Promise<any>
{
    // todo
    await fsl.destroyGroupHistory(c, args.id);
}

export async function createGroupHistoryCmt(c: Context, args: any): Promise<any>
{
    const id = new mongo.ObjectId;
    const doc = {
        _id: id,
        issuedDate: c.now.now(),
        lastModifiedAt: c.now.now(),
        history: args.history,
        author: args.author,
        body: args.body,
    };
    await fsl.createGroupHistoryCmt(c, doc);
}

export async function updateGroupHistoryCmt(c: Context, args: any): Promise<any>
{
    const doc = {
        _id: args.historyCmtId,
        lastModifiedAt: c.now.now(),
        ...("body" in args)?
            {body: args.body}:
            {},
    };
    await fsl.updateGroupHistoryCmt(c, doc)
}

export async function destroyGroupHistoryCmt(c: Context, args: any): Promise<any>
{
    await fsl.destroyGroupHistoryCmt(c, args.historyCmtId);
}

export async function createGroupBill(c: Context, args: any): Promise<any>
{
    const id = new mongo.ObjectId();
    const doc = {
        _id: id,
        issuedDate: c.now.now(),
        lastModifiedAt: c.now.now(),
        author: args.author,
        group: args.group,
        targets: args.targets,
        amount: args.amount,
        title: args.title,
        body: args.body,
        deadline: args.deadline,
        receivingAccount: args.receivingAccount,
        kakaoUrl: args.kakaoUrl,
        tossUrl: args.tossUrl,

        targetsPaid: [],
        isClosed: false,
    };
    await fsl.createGroupBill(c, doc);
}

export async function updateGroupBill(c: Context, args: any): Promise<any>
{
    const doc = {
        _id: args.id,
        lastModifiedAt: c.now.now(),
        ...("title" in args)?
            {title: args.title}:
            {},
        ...("body" in args)?
            {body: args.body}:
            {},
        ...("deadline" in args)?
            {deadline: args.deadline}:
            {},
        ...("receivingAccount" in args)?
            {receivingAccount: args.receivingAccount}:
            {},
        ...("kakaoUrl" in args)?
            {kakaoUrl: args.kakaoUrl}:
            {},
        ...("tossUrl" in args)?
            {tossUrl: args.tossUrl}:
            {},
    };
    await fsl.updateGroupBill(c, doc);
}

export async function destroyGroupBill(c: Context, args: any): Promise<any>
{
    await fsl.destroyGroupBill(c, args.id);
}

export async function payGroupBill(c: Context, args: any): Promise<any>
{
    // Get users paid.
    const {targetsPaid: usersPaid} = await c.mongo.collec(CollecKind.GroupBill).findOne(
        {_id: args.billId},
        {_id: 0, targetsPaid: 1}
    );

    // Add one user.
    const afterAddNewPaid = addAsSet(usersPaid, [args.userId]);

    // Apply back.
    await fsl.updateGroupBill(c, {
        _id: args.billId,
        targetsPaid: afterAddNewPaid,
    });
}

export async function requestReissuingGroupBill(c: Context, args: any): Promise<any>
{
    // Get users paid.
    const {targetsPaid: usersPaid} = await c.mongo.collec(CollecKind.GroupBill).findOne(
        {_id: args.billId},
        {_id: 0, targetsPaid: 1}
    );

    // Remove one user.
    const afterRemovePaid = removeAsSet(usersPaid, [args.userId]);

    // Apply back.
    await fsl.updateGroupBill(c, {
        _id: args.billId,
        targetsPaid: afterRemovePaid,
    });
}

export async function closeGroupBill(c: Context, args: any): Promise<any>
{
    await fsl.updateGroupBill(c, {_id: args.id, isClosed: true});
}


export async function openGroupBill(c: Context, args: any): Promise<any>
{
    await fsl.updateGroupBill(c, {_id: args.id, isClosed: false});
}

export async function createGroupVote(c: Context, args: any): Promise<{id: mongo.ObjectId}>
{
    const id = new mongo.ObjectId();
    const doc = {
        _id: id,
        issuedDate: c.now.now(),
        lastModifiedAt: c.now.now(),
        group: args.group,
        author: args.author,
        choices: args.choices.map(
            (choiceName: string)=>({
                _id: uuid.v4(),
                value: choiceName,
            })
        ),
        targets: args.targets,
        allowMultipleChoices: args.allowMultipleChoices,
        isAnonymous: args.isAnonymous,
        title: args.title,
        body: args.body,
        deadline: args.deadline,
    };
    await fsl.createGroupVote(c, doc);
    return {id: id};
}

export async function updateGroupVote(c: Context, args: any): Promise<any>
{
    const doc = {
        _id: args.voteId,
        lastModifiedAt: c.now.now(),
        ...("isAnonymous" in args)?
            {isAnonymous: args.isAnonymous}:
            {},
        ...("title" in args)?
            {title: args.title}:
            {},
        ...("body" in args)?
            {body: args.body}:
            {},
        ...("deadline" in args)?
            {deadline: args.deadline}:
            {},
    };
    await fsl.updateGroupVote(c, doc);
}

export async function destroyGroupVote(c: Context, args: any): Promise<any>
{
    await fsl.destroyGroupVote(c, args.voteId);
}

export async function castGroupVote(c: Context, args: any): Promise<any>
{
    // Get 2 values from the server.
    const {allowMultipleChoices, decisions}:
        {
            allowMultipleChoices: boolean,
            decisions: VoteDecision[],
        } =
        await c.mongo.collec(CollecKind.GroupVote).findOne(
        {_id: args.voteId},
        {_id: 0, allowMultipleChoices: 1, decisions: 1}
    );

    // check whether the decision is in choices set.
    if ( !allowMultipleChoices )
    {
        if ( args.choices.length != 1 )
        {
            throw {type: "INVALID_CHOICE"};
        }
    }
    else {
        if (args.choices.length < 1)
        {
            throw {type: "INVALID_CHOICE"};
        }
    }

    // Create the new decision, which new choices applied.
    const newDecisions = decisions.map(
        (decision: VoteDecision)=>{
            if ( decision.voter == args.userId )
            {
                return {
                    voter: args.userId,
                    choices: args.choices,
                };
            }
            else
            {
                return decision;
            }
        }
    );

    // Add the new decision to the db.
    await fsl.updateGroupVote(c, {
        _id: args.voteId,
        decisions: newDecisions,
    });
}

export async function createChatRoomOfGroup(
    c: Context,
    args: {
        groupId: mongo.ObjectId,
        title: string,
        initialMembers: mongo.ObjectId[],
    }
): Promise<any>
{
    const id = new mongo.ObjectId();
    const doc = {
        _id: id,
        issuedDate: c.now.now(),
        title: args.title,
        host: {
            kind: ChatHostKind.Group,
            group: args.groupId,
        } as ChatHostGroup,
    };
    await fsl.createChatRoom(c, doc);

    // Add chat members.
    await Promise.all(
        args.initialMembers.map(
            (member: mongo.ObjectId)=>fsl.addChatMember(
                c,
                new mongo.ObjectId(),
                id,
                member
            )
        )
    );
}


export async function createChatRoomOfGroupQna(
    c: Context,
    args: {
        groupId: mongo.ObjectId,
        userId: mongo.ObjectId,
        title: string,
    }
): Promise<any>
{
    const id = new mongo.ObjectId();
    const doc = {
        _id: id,
        issuedDate: c.now.now(),
        title: args.title,
        host: {
            kind: ChatHostKind.GroupQna,
            group: args.groupId,
            user: args.userId,
        } as ChatHostGroupQna,
    };
    await fsl.createChatRoom(c, doc);

    // Add chat members.
    await Promise.all(
        [args.userId].map(
            (member: mongo.ObjectId)=>fsl.addChatMember(
                c,
                new mongo.ObjectId(),
                id,
                member
            )
        )
    );
}

export async function updateChatRoom(
    c: Context,
    args: {
        chatRoomId: mongo.ObjectId,
        title?: string,
        membersAdded?: mongo.ObjectId[],
        membersRemoved?: mongo.ObjectId[],
    }
): Promise<any>
{
    // Change properties.
    const doc = {
        _id: args.chatRoomId,
        ...("title" in args)?
            {title: args.title}:
            {},
    };
    await fsl.updateChatRoom(c, doc);

    // Change members property.
    if ( args.membersRemoved != null )
    {
        await Promise.all(args.membersRemoved.map(
            (member: mongo.ObjectId)=>fsl.removeChatMember(c, args.chatRoomId, member)
        ));
    }
    if ( args.membersAdded != null )
    {
        await Promise.all(args.membersAdded.map(
            (member: mongo.ObjectId)=>fsl.addChatMember(
                c,
                new mongo.ObjectId(),
                args.chatRoomId,
                member
            )
        ));
    }
}

export async function destroyChatRoom(
    c: Context,
    args: {
        id: mongo.ObjectId,
    }
): Promise<any>
{
    await fsl.destroyChatRoom(c, args.id);
}

export async function postChatMsg(
    c: Context,
    args: {
        chatRoomId: mongo.ObjectId,
        authorId: mongo.ObjectId,
        textBody: mongo.ObjectId,
    }
): Promise<any>
{
    const id = new mongo.ObjectId();
    const doc = {
        _id: id,
        issuedDate: c.now.now(),
        lastModifiedAt: c.now.now(),
        chatRoom: args.chatRoomId,
        author: args.authorId,
        body: {
            kind: ChatMsgKind.Text,
            body: args.textBody,
        },
    };
    await fsl.createChatMsg(c, doc);
}

export async function postFileChatMsg(
    c: Context,
    args: {
        chatRoomId: mongo.ObjectId,
        authorId: mongo.ObjectId,
        file: FileAllocator,
}): Promise<any>
{
    const id = new mongo.ObjectId();
    const doc = {
        _id: id,
        issuedDate: c.now.now(),
        lastModifiedAt: c.now.now(),
        chatRoom: args.chatRoomId,
        author: args.authorId,
        body: {
            kind: ChatMsgKind.File,
            body: await args.file.allocate([
                CollecKind.ChatMsg,
                id.toString(),
                "body",
            ]),
        },
    };
    await fsl.createChatMsg(c, doc);
}

export async function groupBill(
    c: Context,
    args: {
        id: mongo.ObjectId,
    }
): Promise<{id: mongo.ObjectId} | null>
{
    if ( await exists(c, CollecKind.GroupBill, args.id) )
    {
        return {id: args.id};
    }
    else
    {
        return null;
    }
}

export function bypassId(colKind: CollecKind): Function
{
    return async (
        parent: any,
        args: any,
        c: Context,
    )=>{
        if ( await exists(c, colKind, new mongo.ObjectId(args.id)) )
        {
            return {id: args.id}
        }
        else
        {
            return null;
        }
    };
}

export async function exists(
    c: Context,
    collecKind: CollecKind,
    id: mongo.ObjectId
): Promise<boolean>
{
    const doc = await c.mongo.collec(collecKind).findOne(
        {_id: id},
        {isDeleted: 1}
    );
    if ( doc != null )
    {
        return !doc.isDeleted
    }
    else
    {
        return false;
    }
}

export async function signIn(
    c: Context,
    a: {
        email: string,
        password: string,
    }
): Promise<{
    token: string;
    userId: mongo.ObjectId,
}>
{
    const token = await createTokenFromEmailPassword(c, a.email, a.password);
    const userId = await findUserByEmailPassword(c, a.email, a.password);
    return {
        token: token,
        userId: userId,
    };
}

export async function refreshToken(
    c: Context,
    a: {
        oldToken: string,
    }
): Promise<string>
{
    return await loginToken.refreshToken(c, a.oldToken);
}

export async function updateUser(
    c: Context,
    a: {
        userId: mongo.ObjectId,
        password?: string,
    }
)
{
    const doc = {
        _id: a.userId,
        ...(a.userId !== undefined)?
            {password: a.password}:
            {},
    };
    await fsl.updateUser(
        c,
        doc
    );
}

export async function requestStudentVerification(
    c: Context,
    a: {
        userId: mongo.ObjectId,
        evidences: FileAllocator[],
        majors: string[],
        admissionYear: string,
    }
): Promise<{id: mongo.ObjectId}>
{
    const id = new mongo.ObjectId();
    const now = new Date(Date.now());

    const doc = {
        _id: id,
        issuedDate: now,
        state: StudentVerificationState.Pended,
        evidences: await Promise.all(
            a.evidences.map(
                (evidence: FileAllocator)=>evidence.allocate([CollecKind.StudentVerification, id.toString(), "evidences"])
            )
        ),
        majors: a.majors,
        admissionYear: a.admissionYear,
    };
    await fsl.createStudentVerification(c, doc);
    return {id};
}

export async function confirmStudentVerification(
    c: Context,
    args: {
        studentVerificationId: mongo.ObjectId,
    }
)
{
    const now = new Date(Date.now());
    await fsl.updateStudentVerification(
        c,
        {
            _id: args.studentVerificationId,
            state: StudentVerificationState.Confirmed,
            fixedDate: now,
        }
    );
}

export async function rejectStudentVerification(
    c: Context,
    args: {
        studentVerificationId: mongo.ObjectId,
    }
)
{
    const now = new Date(Date.now());
    await fsl.updateStudentVerification(
        c,
        {
            _id: args.studentVerificationId,
            state: StudentVerificationState.Rejected,
            fixedDate: now,
        }
    );
}

export async function createGroup(
    c: Context,
    args: {
        owner: mongo.ObjectId,
        name: string,
        brief: string,
        introduction: string,
        isSchool: boolean,
        association: string,
        poster?: FileAllocator,
        background?: FileAllocator,
        category: string,
        applicationState?: any
    }
): Promise<{id: mongo.ObjectId}>
{
    const id = new mongo.ObjectId();
    const now = new Date(Date.now());
    const doc = {
        _id: id,
        issuedDate: now,
        owner: args.owner,
        name: args.name,
        brief: args.brief,
        introduction: args.introduction,
        isSchool: args.isSchool,
        association: args.association,
        ...(args.poster != null)?
            {poster: await args.poster.allocate([CollecKind.Group, id.toString(), "poster"])}:
            {},
        ...(args.background != null)?
            {background: await args.background.allocate([CollecKind.Group, id.toString(), "background"])}:
            {},
        category: args.category,
        applicationState: args.applicationState,
    };
    await fsl.createGroup(c, doc);
    return {id};
}

export async function updateGroup(
    c: Context,
    a: {
        groupId: mongo.ObjectId,
        name?: string,
        brief?: string,
        introduction?: string,
        unsetPoster?: boolean,
        unsetBackground?: boolean,
        poster?: FileAllocator,
        background?: FileAllocator,
        category?: string,
        unsetApplicationState?: boolean,
        applicationState?: boolean,
    }
)
{
    const doc = {
        _id: a.groupId,
        ...(a.name != null)?
            {name: a.name}:
            {},
        ...(a.brief != null)?
            {brief: a.brief}:
            {},
        ...(a.introduction != null)?
            {introduction: a.introduction}:
            {},
        ...()=>{
            if ( a.unsetPoster )
            {
                return {poster: null};
            }
            else
            {
                if ( a.poster != null )
                {
                    return {poster: a.poster.allocate([CollecKind.Group, a.groupId.toString(), "poster"])};
                }
            }
        },
        ...()=>{
            if ( a.unsetBackground )
            {
                return {background: null};
            }
            else
            {
                if ( a.background != null )
                {
                    return {background: a.background.allocate([CollecKind.Group, a.groupId.toString(), "background"])};
                }
            }
        },
        ...(a.category != null)?
            {category: a.category}:
            {},
        ...()=>{
            if ( a.unsetApplicationState )
            {
                return {applicationState: null};
            }
            else
            {
                if ( a.applicationState != null )
                {
                    return {applicationState: a.applicationState};
                }
            }
        },
    };
    await fsl.updateGroup(c, doc);
}

export async function applyGroup(
    c: Context,
    args: {
        groupId: mongo.ObjectId,
        userId: mongo.ObjectId,
    }
)
{
    // todo check user exists.
    // todo check group exists.
    // todo check whether user is already the member of the group.
    // Can apply to the group when GroupMemberKind is NotMember.
    const memberKind = await groupMemberKind(
        c,
        args.groupId,
        args.userId,
    );
    if ( memberKind == GroupMemberKind.NotMember )
    {
        // todo DO NOT CALL RAW ACTION IN BUSINESS LOGIC.
        const newMemberId = new mongo.ObjectId();
        await c.mongo.collec(CollecKind.GroupMember).insertOne({
            _id: newMemberId,
            group: args.groupId,
            user: args.userId,
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
    args: {
        groupId: mongo.ObjectId,
        userId: mongo.ObjectId,
    }
)
{
    // todo check user exists.
    // todo check group exists.
    // todo check whether user is already the member of the group.

    // Only Applicant, Manager, and Normal members can leave.
    const memberKind = await groupMemberKind(c, args.groupId, args.userId);
    switch ( memberKind )
    {
        case GroupMemberKind.Applicant:
        case GroupMemberKind.Manager:
        case GroupMemberKind.Normal:
        {
            // todo DO NOT CALL RAW ACTION IN BUSINESS LOGIC.
            await c.mongo.collec(CollecKind.GroupMember).deleteOne({group: args.groupId, user: args.userId});
            break;
        }
        default:
            throw new Error(""); // todo there can be a better error format.
    }
}

export async function updateMember(
    c: Context,
    args: {
        groupId: mongo.ObjectId,
        userId: mongo.ObjectId,
        newMemberKind: GroupMemberKind,
    }
)
{
    // todo check user exists.
    // todo check group exists.
    // todo check whether user is the member of the group.

    // Only newKind of Manager, Normal can be possible.
    if (
        args.newMemberKind == GroupMemberKind.Normal ||
        args.newMemberKind == GroupMemberKind.Manager
    )
    {
        // Only prevKind of Applicant, Manager, Normal can be possible.
        const memberKind = await groupMemberKind(c, args.groupId, args.userId);
        switch ( memberKind )
        {
            case GroupMemberKind.Normal:
            case GroupMemberKind.Manager:
            case GroupMemberKind.Applicant:
            {
                // todo DO NOT CALL RAW ACTION IN BUSINESS LOGIC.
                const find = {user: args.userId, group: args.groupId};
                const update = {$set: {kind: args.newMemberKind}};
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
    args: {
        groupId: mongo.ObjectId,
        newOwnerId: mongo.ObjectId,
    }
)
{
    // Find the previous owner.
    const group = c.mongo.collec(CollecKind.Group).findOne({_id: args.groupId});
    if ( group != null )
    {
        // todo check whether the new owner is valid.
        // Reset group owner.
        await c.mongo.collec(CollecKind.Group).updateOne({_id: args.groupId}, {$set: {owner: args.newOwnerId}});

        // Add new member.
        // If there's already one, it will fail automatically.
        // todo DO NOT CALL RAW ACTION IN BUSINESS LOGIC.
        const newMemId = new mongo.ObjectId();
        await c.mongo.collec(CollecKind.GroupMember).insertOne({
            _id: newMemId,
            group: args.groupId,
            user: args.newOwnerId,
            kind: GroupMemberKind.Manager,
        });
    }
    else
    {
        throw 0; // todo place good error, there's no matching group.
    }
}

export async function createGroupQna(
    c: Context,
    args: {
        groupId: mongo.ObjectId,
        authorId: mongo.ObjectId,
        body: string,
    }
): Promise<{id: mongo.ObjectId}>
{
    const id = new mongo.ObjectId();
    const now = new Date(Date.now()); // todo fixxxxxx this!
    const doc = {
        author: args.authorId,
        group: args.groupId,
        body: args.body,

        _id: id,
        issuedDate: now,
    }
    await fsl.createGroupQna(c, doc);
    return {id};
}

export async function updateGroupQna(
    c: Context,
    args: {
        qnaId: mongo.ObjectId,
        body?: string,
    }
)
{
    const doc = {
        _id: args.qnaId,
        ...(args.body != null)?
            {body: args.body}:
            {}
    };
    await fsl.updateGroupQna(c, doc);
}

export async function answerGroupQna(
    c: Context,
    args: {
        qnaId: mongo.ObjectId,
        answer: string,
    }
)
{
    const doc = {
        _id: args.qnaId,
        answer: args.answer,
    };
    await fsl.updateGroupQna(c, doc);
}

export async function createGroupSchedule(
    c: Context,
    args: {
        groupId: mongo.ObjectId,
        title: string,
        date: Date,
        targets: mongo.ObjectId[],
    }
): Promise<{id: mongo.ObjectId}>
{
    const id = new mongo.ObjectId();

    const doc = {
        _id: id,
        group: args.groupId,
        title: args.title,
        date: args.date,
        targets: args.targets,
    };

    await fsl.createGroupSchedule(c, doc);

    return {id};
}

export async function updateGroupSchedule(
    c: Context,
    args: {
        scheduleId: mongo.ObjectId,
        title?: string,
        date?: Date,
        targets?: mongo.ObjectId[],
    }
)
{
    const doc = {
        _id: args.scheduleId,
        ...(args.title != null)?
            {title: args.title}:
            {},
        ...(args.date != null)?
            {date: args.date}:
            {},
        ...(args.targets != null)?
            {targets: args.targets}:
            {},
    };
    await fsl.updateGroupSchedule(c, doc);
}

export async function createGroupNotice(
    c: Context,
    args: {
        groupId: mongo.ObjectId,
        authorId: mongo.ObjectId,
        isUrgent: boolean,
        title: string,
        body: string,
        files: FileAllocator[],
        images: FileAllocator[],
    }
): Promise<{id: mongo.ObjectId}>
{
    const id = new mongo.ObjectId();
    const now = new Date(Date.now());
    const doc = {
        _id: id,
        issuedDate: now,
        lastModifiedAt: now,
        group: args.groupId,
        author: args.authorId,
        isUrgent: args.isUrgent,
        title: args.title,
        body: args.body,
        files: await Promise.all(
                args.files.map((f: FileAllocator)=>f.allocate(
                [CollecKind.GroupNotice, id.toString(), "files"]
            ))
        ),
        images: await Promise.all(
            args.images.map((f: FileAllocator)=>f.allocate(
                [CollecKind.GroupNotice, id.toString(), "images"]
            ))
        ),
    };
    await fsl.createGroupNotice(c, doc);

    return {id};
}

export async function updateGroupNotice(
    c: Context,
    args: {
        noticeId: mongo.ObjectId,
        isUrgent?: boolean,
        title?: string,
        body?: string,
        filesAdded?: FileAllocator[],
        filesRemoved?: string[],
        imagesAdded?: FileAllocator[],
        imagesRemoved?: string[],
    }
)
{
    // Get images and files.
    const {images, files} = await c.mongo.collec(CollecKind.GroupNotice).findOne(
        {_id: args.noticeId, isDeleted: {$not: {$eq: true}}},
        {images: 1, files: 1}
    );

    // Add and remove.
    const newImages = new Set<string>(images);
    if ( args.imagesAdded )
    {
        await Promise.all(args.imagesAdded.map(
            async (file: FileAllocator)=>{
                const key = await file.allocate([CollecKind.GroupNotice, args.noticeId.toString(), "images"]);
                newImages.add(key);
            }
        ));
    }
    if ( args.imagesRemoved )
    {
        args.imagesRemoved.forEach(
            (file: string)=>newImages.delete(file)
        );
    }
    const newFiles = new Set<string>(files);
    if ( args.filesAdded )
    {
        await Promise.all(args.filesAdded.map(
            async (file: FileAllocator)=>{
                const key = await file.allocate([CollecKind.GroupNotice, args.noticeId.toString(), "files"]);
                newFiles.add(key);
            }
        ));
    }
    if ( args.filesRemoved )
    {
        args.filesRemoved.forEach(
            (file: string)=>newFiles.delete(file)
        );
    }


    const now = new Date(Date.now());
    const doc = {
        _id: args.noticeId,
        lastModifiedAt: now,
        ...(args.isUrgent != null)?
            {isUrgent: args.isUrgent}:
            {},
        ...(args.title != null)?
            {title: args.title}:
            {},
        ...(args.body != null)?
            {body: args.body}:
            {},
        files: Array.from(newFiles),
        images: Array.from(newImages),
    };
    await fsl.updateGroupNotice(c, doc);
}
