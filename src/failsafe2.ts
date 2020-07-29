import {Context} from "./context";
import mongo from "mongodb";
import {CollecKind} from "./enums";
import {Gender} from "./enums/Gender";
import {StudentVerificationState} from "./enums/StudentVerificationState";

export async function createUser(
    c: Context,
    args: {
        _id: mongo.ObjectId,
        issuedDate: Date,
        email: string,
        password: string,
        name: string,
        birthday: string,
        gender: Gender,
        phoneNumber: string,
    }
)
{
    // todo check duplicated phone number.

    await c.mongo.collec(CollecKind.User).insertOne(args);
}

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

export async function updateUser(
    c: Context,
    args: {
        _id: mongo.ObjectId,
        password?: string,
    }
)
{
    const updateDoc = {
        ...(args.password !== undefined)?
            {password: args.password}:
            {},
    };
    await c.mongo.collec(CollecKind.User).updateOne(
        {_id: args._id, isDeleted: {$not: {$eq: true}}},
        {$set: updateDoc},
    );
}

export async function createStudentVerification(
    c: Context,
    a: {
        _id: mongo.ObjectId,
        issuedDate: Date,
        state: StudentVerificationState,
        evidences: string[],
        majors: string[],
        admissionYear: string,
    }
)
{
    // todo check user existance.
    // todo check majors existances.
    await c.mongo.collec(CollecKind.StudentVerification).insertOne(
        a
    );
}

export async function updateStudentVerification(
    c: Context,
    a: {
        _id: mongo.ObjectId,
        issuedDate?: Date,
        state?: StudentVerificationState,
        fixedDate?: Date,
    }
)
{
    // todo: check whether student verification object is valid.
    // todo: if state is not PENDED, fixedDate must be given. Else, must be null.
    const doc = {
        ...(a.issuedDate !== undefined)?
            {issuedDate: a.issuedDate}:
            {},
        ...(a.state !== undefined)?
            {state: a.state}:
            {},
        ...(a.fixedDate !== undefined)?
            {fixedDate: a.fixedDate}:
            {},
    };
    await c.mongo.collec(CollecKind.StudentVerification).updateOne(
        {_id: a._id, isDeleted: {$now: {$eq: true}}},
        {$set: doc},
    );
}

export async function createGroup(
    c: Context,
    a: {
        _id: mongo.ObjectId,
        issuedDate: Date,
        owner: mongo.ObjectId,
        name: string,
        brief: string,
        introduction: string,
        isSchool: boolean,
        association: string,
        poster?: string
        background?: string,
        category: string,
        applicationState?: any,
    }
)
{
    // todo check owner existance.
    // todo check association existance
    // todo check category existance

    await c.mongo.collec(CollecKind.Group).insertOne(a);
}

export async function updateGroup(
    c: Context,
    a: {
        _id: mongo.ObjectId,
        issuedDate?: Date,
        name?: string,
        brief?: string,
        introduction?: string,
        poster?: string | null,
        background?: string | null,
        category?: string,
        applicationState?: any | null,
    }
)
{
    // todo check _id existance.
    // todo check category existance
    const doc = {
        ...(a.issuedDate != null)?
            {issuedDate: a.issuedDate}:
            {},
        ...(a.name != null)?
            {name: a.name}:
            {},
        ...(a.brief != null)?
            {brief: a.brief}:
            {},
        ...(a.introduction != null)?
            {introduction: a.introduction}:
            {},
        ...(a.poster != null)?
            {poster: a.poster}:
            {},
        ...(a.background != null)?
            {background: a.background}:
            {},
        ...(a.category != null)?
            {category: a.category}:
            {},
        ...(a.applicationState != null)?
            {applicationState: a.applicationState}:
            {},
    };
    await c.mongo.collec(CollecKind.Group).updateOne(
        {_id: a._id, isDeleted: {$not: {$eq: true}}},
        {$set: doc},
    );
}

export async function createGroupQna(
    c: Context,
    args: {
        _id: mongo.ObjectId,
        issuedDate: Date,
        author: mongo.ObjectId,
        group: mongo.ObjectId,
        body: string,
        answer?: string,
    }
)
{
    // todo check author existance.
    // todo check group existance.
    await c.mongo.collec(CollecKind.GroupQna).insertOne(args);
}

export async function updateGroupQna(
    c: Context,
    args: {
        _id: mongo.ObjectId,
        issuedDate?: Date,
        body?: string,
        answer?: string | null,
    }
)
{
    // todo check qna existance.
    const doc = {
        ...(args.issuedDate != null)?
            {issuedDate: args.issuedDate}:
            {},
        ...(args.body != null)?
            {body: args.body}:
            {},
        ...(args.answer !== undefined)?
            {answer: args.answer}:
            {},
    };
    await c.mongo.collec(CollecKind.GroupQna).updateOne(
        {_id: args._id, isDeleted: {$not: {$eq: true}}},
        doc
    );
}

export async function createGroupSchedule(
    c: Context,
    args: {
        _id: mongo.ObjectId,
        group: mongo.ObjectId,
        title: string,
        date: Date,
        targets: mongo.ObjectId[],
    }
)
{
    await c.mongo.collec(CollecKind.GroupSchedule).insertOne(args);
}

export async function updateGroupSchedule(
    c: Context,
    args: {
        _id: mongo.ObjectId,
        title?: string,
        date?: Date,
        targets?: mongo.ObjectId[],
    }
)
{
    // todo check group schedule exitsnace.
    // todo Check all targets for existance.
    const doc = {
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
    await c.mongo.collec(CollecKind.GroupSchedule).updateOne(

        {_id: args._id, isDeleted: {$not: {$eq: true}}},
        {$set: doc},
    );
}

export async function createGroupNotice(
    c: Context,
    args: {
        _id: mongo.ObjectId,
        issuedDate: Date,
        lastModifiedAt: Date,
        group: mongo.ObjectId,
        author: mongo.ObjectId,
        isUrgent: boolean,
        title: string,
        body: string,
        files: string[],
        images: string[],
    }
)
{
    // todo check group and author existance.
    await c.mongo.collec(CollecKind.GroupNotice).insertOne(args);
}

export async function updateGroupNotice(
    c: Context,
    args: {
        _id: mongo.ObjectId,
        issuedDate?: Date,
        lastModifiedAt?: Date,
        isUrgent?: boolean,
        title?: string,
        body?: string,
        files?: string[],
        images?: string[],
    }
)
{
    const doc = {
        _id: args._id,
        ...(args.issuedDate != null)?
            {issuedDate: args.issuedDate}:
            {},
        ...(args.lastModifiedAt != null)?
            {lastModifiedAt: args.lastModifiedAt}:
            {},
        ...(args.isUrgent != null)?
            {isUrgent: args.isUrgent}:
            {},
        ...(args.title != null)?
            {title: args.title}:
            {},
        ...(args.body != null)?
            {body: args.body}:
            {},
        ...(args.files != null)?
            {files: args.files}:
            {},
        ...(args.images != null)?
            {images: args.images}:
            {},
    };
    // todo check id existance.
    await c.mongo.collec(CollecKind.GroupNotice).updateOne(
        {_id: args._id, isDeleted: {$not: {$eq: true}}},
        doc,
    );
}
