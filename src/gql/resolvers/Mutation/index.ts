import {Context} from "../../../context";
import {
    answerGroupQna,
    applyGroup,
    createGroup,
    createGroupNotice,
    createGroupQna,
    createGroupSchedule,
    createStudentVerification,
    findUserByEmailPassword,
    fixStudentVerification,
    leaveGroup,
    signUp as biSignUp,
    succeedGroupOwner,
    updateGroup,
    updateGroupNotice,
    updateGroupQna,
    updateGroupSchedule,
    updateMember,
    updateUser
} from "../../../bl";
import {createTokenFromEmailPassword, refreshToken} from "../../../login-token";
import mongo from "mongodb";
import {throwNimpl} from "../../../errors";
import {RawGraphqlUpload, toGraphqlUpload} from "../../../graphql-upload";
import {gqlUpload} from "../../../s3";
import {convUnset, emptyWrap} from "../util";
import {externReqHandler, gqlWrap, throwInvalid, throwUnauth} from "../../../scratch";
import {caster, CasterKind, genObjCaster} from "../../../type-cast";
import {authArgGet, authQueryFac, AuthQueryKind, authUserSubjectId} from "../../../auth";
import {
    castGroupVote,
    createChatRoomOfGroup,
    createChatRoomOfGroupQna,
    createGroupVote,
    destroyChatRoom,
    destroyGroupVote, postChatMsg, postFileChatMsg,
    updateChatRoom,
    updateGroupVote
} from "../../../bl2";

export const resolver = {
    signUp: async (_: any, args: any, c: Context)=>{
        // Call business logic.
        const newUserId = await biSignUp(c,  args);
        return {id: newUserId.toString()};
    },
    signIn: async (_: any, args: any, c: Context)=>{
        const token = await createTokenFromEmailPassword(c, args.email, args.password);
        const userId = await findUserByEmailPassword(c, args.email, args.password);
        return {
            token: token,
            userId: userId,
        };
    },
    refreshToken: (_: any, args: any, c: Context)=> {
        return refreshToken(c, args.oldToken);
    },
    updateUser: (_: any, args: any, c: Context)=>{
        updateUser(
            c,
            new mongo.ObjectId(args.userId),
            {...args, userId: undefined}
        );
    },
    destroyUser: (_: any, args: any, c: Context)=>{
        throwNimpl();
    },
    requestStudentVerification: async (_: any, args: any, c: Context)=>{
        const newArgs = {
            ...args,

            // rename, and to mongo id.
            userId: undefined,
            user: new mongo.ObjectId(args.userId),

            // Upload.
            evidences: await Promise.all(args.evidences.map(
                async (evidence: RawGraphqlUpload)=>{
                    const gqlUploadObj = toGraphqlUpload(evidence);
                    const key = await gqlUpload(c, gqlUploadObj);
                    return key;
                }
            )),

            majors: args.majors.map(
                (majorStrId: string)=>(new mongo.ObjectId(majorStrId))
            ),
        };
        const newSvId = await createStudentVerification(c, newArgs);
        return {id: newSvId.toString()};
    },
    confirmStudentVerification: async (_: any, args: any, c: Context)=>{
        await fixStudentVerification(c, new mongo.ObjectId(args.studentVerificationId), true);
    },
    rejectStudentVerification: async (_: any, args: any, c: Context)=>{
        await fixStudentVerification(c, new mongo.ObjectId(args.studentVerificationId), false);
    },
    findPassword: (_: any, args: any, c: Context)=> {
        throwNimpl();
    },

    createGroup: async (_: any, args: any, c: Context)=>{
        const mappedArgs = {
            ...args,

            // uploads
            poster: await gqlUpload(c, toGraphqlUpload(args.poster)),
            backgroud: await gqlUpload(c, toGraphqlUpload(args.background)),
        };
        const newGroupId = await createGroup(c, args);
        return {id: newGroupId.toString()};
    },
    updateGroup: async (_: any, args: any, c: Context)=>{
        const mappedArgs = emptyWrap({
            ...args,

            groupId: undefined,

            // helpers.
            unsetPoster: undefined,
            poster: undefined,
            unsetBackground: undefined,
            background: undefined,

            // uploads
            ...await convUnset(
                c,
                args,
                [
                    ["poster", "unsetPoster", true],
                    ["background", "unsetBackground", true],
                    ["applicationState", "unsetApplicationState", false],
                ],
            ),
        });

        await updateGroup(c, new mongo.ObjectId(args.groupId), args);
    },
    destroyGroup: ()=>throwNimpl(),
    applyGroup: async (_: any, args: any, c: Context)=>{
        await applyGroup(
            c,
            new mongo.ObjectId(args.groupId),
            new mongo.ObjectId(args.userId),
        );
    },
    leaveGroup: async (_: any, args: any, c: Context)=>{
        await leaveGroup(
            c,
            new mongo.ObjectId(args.groupId),
            new mongo.ObjectId(args.userId),
        );
    },
    kickFromGroup: async (_: any, args: any, c: Context)=>{
        await leaveGroup(
            c,
            new mongo.ObjectId(args.groupId),
            new mongo.ObjectId(args.userId),
        );
    },
    updateMember: async (_: any, args: any, c: Context)=>{
        await updateMember(
            c,
            new mongo.ObjectId(args.groupId),
            new mongo.ObjectId(args.userId),
            args.newMemberKind,
        );
    },
    succeedGroupOwner: async (_: any, args: any, c: Context)=>{
        await succeedGroupOwner(
            c,
            new mongo.ObjectId(args.groupId),
            new mongo.ObjectId(args.newOwnerId),
        );
    },

    createGroupQna: async (_: any, args: any, c: Context)=> {
        const newArgs = {
            group: new mongo.ObjectId(args.groupId),
            author: new mongo.ObjectId(args.authorId),
            body: args.body,
        };
        const newId = await createGroupQna(c, newArgs);
        return {id: newId.toString()};
    },
    updateGroupQna: async (_: any, args: any, c: Context)=> {
        const newArgs = {
            body: args.body,
        };
        await updateGroupQna(c, new mongo.ObjectId(args.qnaId), newArgs);
    },
    destroyGroupQna: ()=>throwNimpl(),
    answerGroupQna: async (_: any, args: any, c: Context)=> {
        const newArgs = {
            answer: args.answer,
        };
        await answerGroupQna(c, new mongo.ObjectId(args.qnaId), newArgs);
    },

    createGroupSchedule: async (_: any, args: any, c: Context)=> {
        const newArgs = {
            group: new mongo.ObjectId(args.groupId),
            title: args.title,
            date: args.date,
        };
        const newId = await createGroupSchedule(c, newArgs);
        return {id: newId.toString()};
    },
    updateGroupSchedule: async (_: any, args: any, c: Context)=>{
        await updateGroupSchedule(
            c,
            new mongo.ObjectId(args.scheduleId),
            {
                title: args.title,
                date: args.date,
            },
        );
    },
    destroyGroupSchedule: ()=>throwNimpl(),

    createGroupNotice: async (_: any, args: any, c: Context)=> {
        const newId = await createGroupNotice(
            c,
            {
                group: new mongo.ObjectId(args.groupId),
                author: new mongo.ObjectId(args.authorId),
                isUrgent: args.isUrgent,
                title: args.title,
                body: args.body,
                files: await Promise.all(args.files.map(
                    (file: RawGraphqlUpload)=>gqlUpload(c, toGraphqlUpload(file))
                )),
                images: await Promise.all(args.images.map(
                    (image: RawGraphqlUpload)=>gqlUpload(c, toGraphqlUpload(image))
                )),
            },
        );
        return {id: newId.toString};
    },
    updateGroupNotice: async (_: any, args: any, c: Context)=>{
        await updateGroupNotice(
            c,
            new mongo.ObjectId(args.noticeId),
            {
                isUrgent: args.isUrgent,
                title: args.title,
                body: args.body,

                filesAdded: await Promise.all(args.filesAdded.map(
                    (file: RawGraphqlUpload)=>gqlUpload(c, toGraphqlUpload(file))
                )),
                imagesAdded: await Promise.all(args.imagesAdded.map(
                    (image: RawGraphqlUpload)=>gqlUpload(c, toGraphqlUpload(image))
                )),
                filesRemoved: args.filesRemoved,
                imagesRemoved: args.imagesRemoved,
            },
        );
    },
    destroyGroupNotice: ()=>throwNimpl(),

    createGroupVote: gqlWrap(externReqHandler({
        caster: genObjCaster([
            ["groupId", caster(CasterKind.ToMongoId)],
            ["author", caster(CasterKind.ToMongoId)],
            ["choices", caster(CasterKind.UnsafeBypass)],
            ["targets", caster(CasterKind.UnsafeBypass)],
            ["allowMultipleChoices", caster(CasterKind.UnsafeBypass)],
            ["isAnonymous", caster(CasterKind.UnsafeBypass)],
            ["title", caster(CasterKind.UnsafeBypass)],
            ["body", caster(CasterKind.UnsafeBypass)],
            ["deadline", caster(CasterKind.UnsafeBypass)],
        ]),
        castErrorHandler: ()=>{throw {kind: "INVALID"}},
        authPolicy: authQueryFac(AuthQueryKind.Or)([
            authQueryFac(AuthQueryKind.IsAdmin)(),
            authQueryFac(AuthQueryKind.And)([
                authQueryFac(AuthQueryKind.IsGroupManageable)(authArgGet("groupId")),
                authQueryFac(AuthQueryKind.IsTheUser)(authArgGet("author")),
            ]),
        ]),
        authErrorHandler: ()=>{throw {kind: "UNAUTHORIZED"}},
        uploadPaths: [],
        businessLogic: createGroupVote,
    })),
    updateGroupVote: gqlWrap(externReqHandler({
        caster: genObjCaster([
            ["voteId", caster(CasterKind.ToMongoId)],
            ["isAnonymous", caster(CasterKind.UnsafeBypass)],
            ["title", caster(CasterKind.UnsafeBypass)],
            ["body", caster(CasterKind.UnsafeBypass)],
            ["deadline", caster(CasterKind.UnsafeBypass)],
        ]),
        castErrorHandler: throwInvalid,
        authPolicy: authQueryFac(AuthQueryKind.Or)([
            authQueryFac(AuthQueryKind.IsAdmin)(),
            authQueryFac(AuthQueryKind.IsGroupManageable)(authArgGet("groupId")),
        ]),
        authErrorHandler: throwUnauth,
        uploadPaths: [],
        businessLogic: updateGroupVote,
    })),
    destroyGroupVote: gqlWrap(externReqHandler({
        caster: genObjCaster([
            ["id", caster(CasterKind.ToMongoId)],
        ]),
        castErrorHandler: throwInvalid,
        authPolicy: authQueryFac(AuthQueryKind.Or)([
            authQueryFac(AuthQueryKind.IsAdmin)(),
            authQueryFac(AuthQueryKind.IsGroupManageable)(authArgGet("groupId")),
        ]),
        authErrorHandler: throwUnauth,
        uploadPaths: [],
        businessLogic: destroyGroupVote,
    })),
    castGroupVote: gqlWrap(externReqHandler({
        caster: genObjCaster([
            ["voteId", caster(CasterKind.ToMongoId)],
            ["userId", caster(CasterKind.ToMongoId)],
            ["choices", caster(CasterKind.UnsafeBypass)],
        ]),
        castErrorHandler: throwInvalid,
        authPolicy: authQueryFac(AuthQueryKind.Or)([
            authQueryFac(AuthQueryKind.IsAdmin)(),
            authQueryFac(AuthQueryKind.And)([
                authQueryFac(AuthQueryKind.IsVoteMember)(authArgGet("voteId")),
                authQueryFac(AuthQueryKind.IsTheUser)(authArgGet("userId")),
            ]),
        ]),
        authErrorHandler: throwUnauth,
        uploadPaths: [],
        businessLogic: castGroupVote,
    })),

    createChatRoomOfGroup: gqlWrap(externReqHandler({
        caster: genObjCaster([
            ["groupId", caster(CasterKind.ToMongoId)],
            ["title", caster(CasterKind.UnsafeBypass)],
            ["initialMembers", caster(CasterKind.ToMongoIds)],
        ]),
        castErrorHandler: throwInvalid,
        authPolicy: authQueryFac(AuthQueryKind.Or)([
            authQueryFac(AuthQueryKind.IsAdmin)(),
            authQueryFac(AuthQueryKind.And)([
                authQueryFac(AuthQueryKind.IsGroupManageable)(authArgGet("groupId")),
            ]),
        ]),
        authErrorHandler: throwUnauth,
        uploadPaths: [],
        businessLogic: createChatRoomOfGroup,
    })),
    createChatRoomOfGroupQna: gqlWrap(externReqHandler({
        caster: genObjCaster([
            ["groupId", caster(CasterKind.ToMongoId)],
            ["title", caster(CasterKind.UnsafeBypass)],
            ["userId", caster(CasterKind.ToMongoId)],
        ]),
        castErrorHandler: throwInvalid,
        authPolicy: authQueryFac(AuthQueryKind.Or)([
            authQueryFac(AuthQueryKind.IsAdmin)(),
            authQueryFac(AuthQueryKind.And)([
                authQueryFac(AuthQueryKind.IsTheUser)(authArgGet("userId")),
            ]),
        ]),
        authErrorHandler: throwUnauth,
        uploadPaths: [],
        businessLogic: createChatRoomOfGroupQna,
    })),
    updateChatRoom: gqlWrap(externReqHandler({
        caster: genObjCaster([
            ["chatRoomId", caster(CasterKind.ToMongoId)],
            ["title", caster(CasterKind.UnsafeBypass)],
            ["membersAdded", caster(CasterKind.ToMongoIds)],
            ["membersRemoved", caster(CasterKind.ToMongoIds)],
        ]),
        castErrorHandler: throwInvalid,
        authPolicy: authQueryFac(AuthQueryKind.Or)([
            authQueryFac(AuthQueryKind.IsAdmin)(),
            authQueryFac(AuthQueryKind.IsGroupManageable)(authUserSubjectId()),
            authQueryFac(AuthQueryKind.And)([
                authQueryFac(AuthQueryKind.OnlyContainsTheUser)(authArgGet("membersRemoved")),
            ]),
        ]),
        authErrorHandler: throwUnauth,
        uploadPaths: [],
        businessLogic: updateChatRoom,
    })),
    destroyChatRoom: gqlWrap(externReqHandler({
        caster: genObjCaster([
            ["id", caster(CasterKind.ToMongoId)],
        ]),
        castErrorHandler: throwInvalid,
        authPolicy: authQueryFac(AuthQueryKind.Or)([
            authQueryFac(AuthQueryKind.IsAdmin)(),
            authQueryFac(AuthQueryKind.IsGroupManageable)(authUserSubjectId()),
        ]),
        authErrorHandler: throwUnauth,
        uploadPaths: [],
        businessLogic: destroyChatRoom,
    })),
    postChatMsg: gqlWrap(externReqHandler({
        caster: genObjCaster([
            ["chatRoomId", caster(CasterKind.ToMongoId)],
            ["authorId", caster(CasterKind.ToMongoId)],
            ["textBody", caster(CasterKind.UnsafeBypass)],
        ]),
        castErrorHandler: throwInvalid,
        authPolicy: authQueryFac(AuthQueryKind.Or)([
            authQueryFac(AuthQueryKind.IsAdmin)(),
            authQueryFac(AuthQueryKind.And)([
                authQueryFac(AuthQueryKind.IsChatRoomMember)(authArgGet("authorId")),
                authQueryFac(AuthQueryKind.IsTheUser)(authArgGet("authorId")),
            ]),
        ]),
        authErrorHandler: throwUnauth,
        uploadPaths: [],
        businessLogic: postChatMsg,
    })),
    postFileChatMsg: gqlWrap(externReqHandler({
        caster: genObjCaster([
            ["chatRoomId", caster(CasterKind.ToMongoId)],
            ["authorId", caster(CasterKind.ToMongoId)],
            ["file", caster(CasterKind.UnsafeBypass)],
        ]),
        castErrorHandler: throwInvalid,
        authPolicy: authQueryFac(AuthQueryKind.Or)([
            authQueryFac(AuthQueryKind.IsAdmin)(),
            authQueryFac(AuthQueryKind.And)([
                authQueryFac(AuthQueryKind.IsChatRoomMember)(authArgGet("authorId")),
                authQueryFac(AuthQueryKind.IsTheUser)(authArgGet("authorId")),
            ]),
        ]),
        authErrorHandler: throwUnauth,
        uploadPaths: ["file"],
        businessLogic: postFileChatMsg,
    })),
};

