import {Context} from "./context";
import * as fsl from "./failsafe2";
import mongo from "mongodb";
import {FileAllocator} from "./upload-file";
import {CollecKind} from "./enums";
import {addAsSet, ChatHostGroup, ChatHostGroupQna, ChatMsgKind, removeAsSet, VoteDecision} from "./scratch";
import {ChatHostKind} from "./enums/ChatHostKind";
import {GroupHistoryState} from "./enums/GroupHistoryState";
import * as uuid from "uuid";

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
        c: Context,
        args: {
            id: mongo.ObjectId,
        },
    )=>{
        if ( await exists(c, colKind, args.id) )
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

