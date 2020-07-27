import {Context} from "./context";
import mongo from "mongodb";
import {CollecKind} from "./enums";

export async function createGroupHistory(c: Context, args: any)
{
    // Check group existance.
    // Check author existance.
    // Check author is member of the group.
    // Upload to the db.

    // todo add typecheck.
    const data = {
        _id: args._id,
        issuedDate: args.issuedDate,
        lastModifiedAt: args.lastModifiedAt,
        group: args.group,
        author: args.author,
        state: args.state,
        title: args.title,
        body: args.body,
        images: args.images,
    };
    await c.mongo.collec(CollecKind.GroupHistory).insertOne(data);
}

export async function updateGroupHistory(c: Context, args: any)
{
    // Do update.
    // group, author are not resettable.
    const newData = {
        ...args.issuedDate != null ?
            {issuedDate: args.issuedDate} :
            {},
        ...args.lastModifiedAt != null ?
            {lastModifiedAt: args.lastModifiedAt} :
            {},
        ...args.state != null ?
            {state: args.state} :
            {},
        ...args.title != null ?
            {title: args.title} :
            {},
        ...args.body != null ?
            {body: args.body} :
            {},
        ...args.images != null ?
            {images: args.images} :
            {},
    };
    await c.mongo.collec(CollecKind.GroupHistory).updateOne({_id: args._id}, {$set: newData});
}

export async function destroyGroupHistory(c: Context, id: mongo.ObjectId)
{
    // Do destroying all comments.
    await destroyAllGroupHistoryCmts(c, id);

    // Just delete.
    await c.mongo.collec(CollecKind.GroupHistory).updateOne({_id: id}, {$set: {isDeleted: true}});
}

export async function destroyAllGroupHistoryCmts(c: Context, groupHistoryId: mongo.ObjectId)
{
    await c.mongo.collec(CollecKind.GroupHistoryCmt).updateMany({history: groupHistoryId}, {$set: {isDeleted: true}});
}

export async function createGroupHistoryCmt(c: Context, args: any)
{
    // Check history existance.

    // Do insert.
    const doc = {
        _id: args._id,
        history: args.history,
        issuedDate: args.issuedDate,
        lastModifiedAt: args.lastModifiedAt,
        author: args.author,
        body: args.body,
    };
    await c.mongo.collec(CollecKind.GroupHistoryCmt).insertOne(doc);
}

export async function updateGroupHistoryCmt(c: Context, args: any)
{
    // Do update.
    // author is not resettable.
    const docUpdate = {
        ...args.issuedDate != null ?
            {issuedDate: args.issuedDate} :
            {},
        ...args.lastModifiedAt != null ?
            {lastModifiedAt: args.lastModifiedAt} :
            {},
        ...args.body != null ?
            {body: args.body} :
            {},
    };
    await c.mongo.collec(CollecKind.GroupHistoryCmt).updateOne({_id: args._id}, {$set: docUpdate});
}

export async function destroyGroupHistoryCmt(c: Context, id: mongo.ObjectId)
{
    // Just delete
    await c.mongo.collec(CollecKind.GroupHistoryCmt).updateOne({_id: id}, {$set: {isDeleted: true}});
}

export async function createGroupBill(c: Context, args: any)
{
    // Check group existence.
    // Check author existence.
    // Create one.
    const doc = {
        _id: args._id,
        issuedDate: args.issuedDate,
        lastModifiedAt: args.lastModifiedAt,
        group: args.group,
        author: args.author,
        targets: args.targets,
        amount: args.amount,
        targetsPaid: args.targetsPaid,
        title: args.title,
        body: args.body,
        deadline: args.time,
        receivingAccount: args.receivingAccount,
        kakaoUrl: args.kakaoUrl,
        tossUrl: args.tossUrl,
        isClosed: args.isClosed,
    };
    await c.mongo.collec(CollecKind.GroupBill).insertOne(doc);
}

export async function updateGroupBill(c: Context, args: any)
{
    // Update.
    const updatingDoc = {
        ...("issuedDate" in args)?
            {issuedDate: args.issuedDate}:
            {},
        ...("lastModifiedAt" in args)?
            {lastModifiedAt: args.lastModifiedAt}:
            {},
        ...("targetsPaid" in args)?
            {targetsPaid: args.targetsPaid}:
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
        ...("receivingAccount" in args)?
            {receivingAccount: args.receivingAccount}:
            {},
        ...("kakaoUrl" in args)?
            {kakaoUrl: args.kakaoUrl}:
            {},
        ...("tossUrl" in args)?
            {tossUrl: args.tossUrl}:
            {},
        ...("isClosed" in args)?
            {isClosed: args.isClosed}:
            {},
    };
    await c.mongo.collec(CollecKind.GroupBill).updateOne({_id: args._id}, {$set: updatingDoc});
}

export async function destroyGroupBill(c: Context, id: mongo.ObjectId)
{
    // Just destroy.
    await c.mongo.collec(CollecKind.GroupBill).updateOne({_id: id}, {$set: {isDeleted: true}});
}

export async function createGroupVote(c: Context, args: any)
{
    // Check group existance.
    // Check member existance.
    // Check author existance.
    // Do insert.
    const doc = {
        _id: args._id,
        issuedDate: args.issuedDate,
        lastModifiedAt: args.lastModifiedAt,
        group: args.group,
        author: args.author,
        choices: args.choices,
        targets: args.targets,
        allowMultipleChoices: args.allowMultipleChoices,
        isAnonymous: args.isAnonymous,
        decisions: args.decisions,
        title: args.title,
        body: args.body,
        deadline: args.deadline,
    };
    await c.mongo.collec(CollecKind.GroupVote).insertOne(doc);
}

export async function updateGroupVote(c: Context, args: any)
{
    // Just update.
    const updatingDoc = {
        ...("issuedDate" in args)?
            {issuedDate: args.issuedDate}:
            {},
        ...("lastModifiedAt" in args)?
            {lastModifiedAt: args.lastModifiedAt}:
            {},
        ...("targetsPaid" in args)?
            {targetsPaid: args.targetsPaid}:
            {},
        ...("isAnonymous" in args)?
            {isAnonymous: args.isAnonymous}:
            {},
        ...("deadline" in args)?
            {deadline: args.deadline}:
            {},
        ...("decisions" in args)?
            {decisions: args.decisions}:
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
    await c.mongo.collec(CollecKind.GroupVote).updateOne({_id: args._id}, {$set: updatingDoc});
}

export async function destroyGroupVote(c: Context, id: mongo.ObjectId)
{
    // Just delete.
    await c.mongo.collec(CollecKind.GroupVote).updateONe({_id: id}, {$set: {isDeleted: true}});
}

export async function createChatRoom(c: Context, args: any)
{
    // Check source existence.
    const doc = {
        _id: args._id,
        issuedDate: args.issuedDate,
        title: args.title,
        host: args.host,
    };
    await c.mongo.collec(CollecKind.ChatRoom).insertOne(doc);
}

export async function updateChatRoom(c: Context, args: any)
{
    const updatingDoc = {
        ...("issuedDate" in args)?
            {issuedDate: args.issuedDate}:
            {},
        ...("title" in args)?
            {title: args.title}:
            {},
    };
    await c.mongo.collec(CollecKind.ChatRoom).updateOne({_id: args._id}, {$set: updatingDoc});
}

export async function destroyChatRoom(c: Context, id: mongo.ObjectId)
{
    // Remove all relations and chat messages first.
    // Then, safely remove the chat room.
    await removeAllChatMembers(c, id);
    await removeAllChatMsgs(c, id);
    await c.mongo.collec(CollecKind.ChatRoom).updateOne({_id: id,}, {$set: {isDeleted: true}});
}

export async function removeAllChatMembers(c: Context, chatRoomId: mongo.ObjectId)
{
    await c.mongo.collec(CollecKind.ChatMember).updateMany({chatRoom: chatRoomId}, {$set: {isDeleted: true}});
}

export async function removeAllChatMsgs(c: Context, chatRoomId: mongo.ObjectId)
{
    await c.mongo.collec(CollecKind.ChatMsg).updateMany({chatRoom: chatRoomId}, {$set: {isDeleted: true}});
}

export async function addChatMember(c: Context, id: mongo.ObjectId, chatRoomId: mongo.ObjectId, userId: mongo.ObjectId)
{
    const doc = {
        _id: id,
        chatRoom: chatRoomId,
        user: userId,
    };
    await c.mongo.collec(CollecKind.ChatMember).insertOne(doc);
}

export async function removeChatMember(c: Context, chatRoomId: mongo.ObjectId, userId: mongo.ObjectId)
{
    await c.mongo.collec(CollecKind.ChatMember).deleteMany({chatRoom: chatRoomId, user: userId});
}

export async function createChatMsg(c: Context, args: any)
{
    const doc = {
        _id: args._id,
        issuedDate: args.issuedDate,
        lastModifiedAt: args.lastModifiedAt,
        chatRoom: args.chatRoom,
        author: args.author,
        body: args.body,
    };
    await c.mongo.collec(CollecKind.ChatMsg).insertOne(doc);
}

export async function updateChatMsg(c: Context, args: any)
{
    const updatingDoc = {
        ...("issuedDate" in args)?
            {issuedDate: args.issuedDate}:
            {},
        ...("lastModifiedAt" in args)?
            {lastModifiedAt: args.lastModifiedAt}:
            {},
        ...("body" in args)?
            {body: args.body}:
            {},
    };
    await c.mongo.collec(CollecKind.ChatMsg).updateOne({_id: args._id}, {$set: updatingDoc});
}

export async function destroyChatMsg(c: Context, id: mongo.ObjectId)
{
    // Just delete itself.
    await c.mongo.collec(CollecKind.ChatMsg).updateOne({_id: id}, {isDeleted: true});
}
