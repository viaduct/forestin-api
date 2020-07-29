import {Context} from "../../../context";
import {
    answerGroupQna,
    createGroupNotice,
    createGroupQna,
    createGroupSchedule,
    signUp as blSignUp,
    succeedGroupOwner,
    updateGroupNotice,
    updateGroupQna,
    updateGroupSchedule
} from "../../../bl";
import mongo from "mongodb";
import {throwNimpl} from "../../../errors";
import {RawGraphqlUpload, toGraphqlUpload} from "../../../graphql-upload";
import {gqlUpload} from "../../../s3";
import {externReqHandler, gqlWrap, throwInvalid, throwUnauth} from "../../../scratch";
import {caster, CasterKind, CastKind, EmptiableCaster, emptiableCastWrap, genObjCaster} from "../../../type-cast";
import {authArgGet, authQueryFac, AuthQueryKind, authUserSubjectId} from "../../../auth";
import * as bl from "../../../bl2";
import {
    castGroupVote,
    createChatRoomOfGroup,
    createChatRoomOfGroupQna,
    createGroupVote,
    destroyChatRoom,
    destroyGroupVote,
    postChatMsg,
    postFileChatMsg,
    updateChatRoom,
    updateGroupVote
} from "../../../bl2";

export const resolver = {
    // signUp: async (_: any, args: any, c: Context)=>{
    //     // Call business logic.
    //     const newUserId = await blSignUp(c,  args);
    //     return {id: newUserId.toString()};
    // },
    signUp: gqlWrap(externReqHandler({
        caster: genObjCaster([
            ["email", caster(CasterKind.UnsafeBypass)],
            ["password", caster(CasterKind.UnsafeBypass)],
            ["name", caster(CasterKind.UnsafeBypass)],
            ["birthday", caster(CasterKind.UnsafeBypass)],
            ["gender", caster(CasterKind.UnsafeBypass)],
            ["phoneNumber", caster(CasterKind.UnsafeBypass)],
        ]),
        castErrorHandler: throwInvalid,
        authPolicy: authQueryFac(AuthQueryKind.And)([]),
        authErrorHandler: throwUnauth,
        uploadPaths: [],
        businessLogic: blSignUp,
    })),

    // signIn: async (_: any, args: any, c: Context)=>{
    //     const token = await createTokenFromEmailPassword(c, args.email, args.password);
    //     const userId = await findUserByEmailPassword(c, args.email, args.password);
    //     return {
    //         token: token,
    //         userId: userId,
    //     };
    // },
    signIn: gqlWrap(externReqHandler({
        caster: genObjCaster([
            ["email", caster(CasterKind.UnsafeBypass)],
            ["password", caster(CasterKind.UnsafeBypass)],
        ]),
        castErrorHandler: throwInvalid,
        authPolicy: authQueryFac(AuthQueryKind.And)([]),
        authErrorHandler: throwUnauth,
        uploadPaths: [],
        businessLogic: bl.signIn
    })),
    // refreshToken: (_: any, args: any, c: Context)=> {
    //     return refreshToken(c, args.oldToken);
    // },
    refreshToken: gqlWrap(externReqHandler({
        caster: genObjCaster([
            ["oldToken", caster(CasterKind.UnsafeBypass)],
        ]),
        castErrorHandler: throwInvalid,
        authPolicy: authQueryFac(AuthQueryKind.And)([]),
        authErrorHandler: throwUnauth,
        uploadPaths: [],
        businessLogic: bl.refreshToken
    })),
    // updateUser: (_: any, args: any, c: Context)=>{
    //     updateUser(
    //         c,
    //         new mongo.ObjectId(args.userId),
    //         {...args, userId: undefined}
    //     );
    // },
    updateUser: gqlWrap(externReqHandler({
        caster: genObjCaster([
            ["userId", caster(CasterKind.ToMongoId)],
            ["password", caster(CasterKind.UnsafeBypass)],
        ]),
        castErrorHandler: throwInvalid,
        authPolicy: authQueryFac(AuthQueryKind.Or)([
            authQueryFac(AuthQueryKind.IsAdmin)(),
            authQueryFac(AuthQueryKind.IsTheUser)(authArgGet("userId")),
        ]),
        authErrorHandler: throwUnauth,
        uploadPaths: [],
        businessLogic: bl.updateUser,
    })),
    destroyUser: (_: any, args: any, c: Context)=>{
        throwNimpl();
    },
    // requestStudentVerification: async (_: any, args: any, c: Context)=>{
    //     const newArgs = {
    //         ...args,
    //
    //         // rename, and to mongo id.
    //         userId: undefined,
    //         user: new mongo.ObjectId(args.userId),
    //
    //         // Upload.
    //         evidences: await Promise.all(args.evidences.map(
    //             async (evidence: RawGraphqlUpload)=>{
    //                 const gqlUploadObj = toGraphqlUpload(evidence);
    //                 const key = await gqlUpload(c, gqlUploadObj);
    //                 return key;
    //             }
    //         )),
    //
    //         majors: args.majors.map(
    //             (majorStrId: string)=>(new mongo.ObjectId(majorStrId))
    //         ),
    //     };
    //     const newSvId = await createStudentVerification(c, newArgs);
    //     return {id: newSvId.toString()};
    // },
    requestStudentVerification: gqlWrap(externReqHandler({
        caster: genObjCaster([
            ["userId", caster(CasterKind.ToMongoId)],
            ["evidences", caster(CasterKind.UnsafeBypass)],
            ["majors", caster(CasterKind.UnsafeBypass)],
            ["admissionYear", caster(CasterKind.UnsafeBypass)],
        ]),
        castErrorHandler: throwInvalid,
        authPolicy: authQueryFac(AuthQueryKind.Or)([
            authQueryFac(AuthQueryKind.IsAdmin)(),
            authQueryFac(AuthQueryKind.IsTheUser)(authArgGet("userId")),
        ]),
        authErrorHandler: throwUnauth,
        uploadPaths: ["evidences/#"],
        businessLogic: bl.requestStudentVerification,
    })),
    // confirmStudentVerification: async (_: any, args: any, c: Context)=>{
    //     await fixStudentVerification(c, new mongo.ObjectId(args.studentVerificationId), true);
    // },
    confirmStudentVerification: gqlWrap(externReqHandler({
        caster: genObjCaster([
            ["studentVerificationId", caster(CasterKind.ToMongoId)],
        ]),
        castErrorHandler: throwInvalid,
        authPolicy: authQueryFac(AuthQueryKind.Or)([
            authQueryFac(AuthQueryKind.IsAdmin)(),
        ]),
        authErrorHandler: throwUnauth,
        uploadPaths: [],
        businessLogic: bl.confirmStudentVerification,
    })),
    // rejectStudentVerification: async (_: any, args: any, c: Context)=>{
    //     await fixStudentVerification(c, new mongo.ObjectId(args.studentVerificationId), false);
    // },
    rejectStudentVerification: gqlWrap(externReqHandler({
        caster: genObjCaster([
            ["studentVerificationId", caster(CasterKind.ToMongoId)],
        ]),
        castErrorHandler: throwInvalid,
        authPolicy: authQueryFac(AuthQueryKind.Or)([
            authQueryFac(AuthQueryKind.IsAdmin)(),
        ]),
        authErrorHandler: throwUnauth,
        uploadPaths: [],
        businessLogic: bl.rejectStudentVerification,
    })),
    findPassword: (_: any, args: any, c: Context)=> {
        throwNimpl();
    },

    // createGroup: async (_: any, args: any, c: Context)=>{
    //     const mappedArgs = {
    //         ...args,
    //
    //         // uploads
    //         poster: await gqlUpload(c, toGraphqlUpload(args.poster)),
    //         backgroud: await gqlUpload(c, toGraphqlUpload(args.background)),
    //     };
    //     const newGroupId = await createGroup(c, args);
    //     return {id: newGroupId.toString()};
    // },
    // todo
    createGroup: gqlWrap(externReqHandler({
        caster: genObjCaster([
            ["owner", caster(CasterKind.ToMongoId)],
            ["name", caster(CasterKind.UnsafeBypass)],
            ["brief", caster(CasterKind.UnsafeBypass)],
            ["introduction", caster(CasterKind.UnsafeBypass)],
            ["isSchool", caster(CasterKind.UnsafeBypass)],
            ["association", caster(CasterKind.UnsafeBypass)],
            ["poster", caster(CasterKind.UnsafeBypass)],
            ["background", caster(CasterKind.UnsafeBypass)],
            ["category", caster(CasterKind.UnsafeBypass)],
            ["applicationState", caster(CasterKind.UnsafeBypass)],
        ]),
        castErrorHandler: throwInvalid,
        authPolicy: authQueryFac(AuthQueryKind.Or)([
            authQueryFac(AuthQueryKind.IsAdmin)(),
            authQueryFac(AuthQueryKind.IsTheUser)(authArgGet("owner")),
        ]),
        authErrorHandler: throwUnauth,
        uploadPaths: ["poster", "background"],
        businessLogic: bl.createGroup,
    })),

    // updateGroup: async (_: any, args: any, c: Context)=>{
    //     const mappedArgs = emptyWrap({
    //         ...args,
    //
    //         groupId: undefined,
    //
    //         // helpers.
    //         unsetPoster: undefined,
    //         poster: undefined,
    //         unsetBackground: undefined,
    //         background: undefined,
    //
    //         // uploads
    //         ...await convUnset(
    //             c,
    //             args,
    //             [
    //                 ["poster", "unsetPoster", true],
    //                 ["background", "unsetBackground", true],
    //                 ["applicationState", "unsetApplicationState", false],
    //             ],
    //         ),
    //     });
    //
    //     await updateGroup(c, new mongo.ObjectId(args.groupId), args);
    // },
    updateGroup: gqlWrap(externReqHandler({
        caster: genObjCaster([
            ["groupId", caster(CasterKind.ToMongoId)],
            ["name", caster(CasterKind.UnsafeBypass)],
            ["brief", caster(CasterKind.UnsafeBypass)],
            ["introduction", caster(CasterKind.UnsafeBypass)],
            ["unsetPoster", caster(CasterKind.UnsafeBypass)],
            ["unsetBackground", caster(CasterKind.UnsafeBypass)],
            ["poster", caster(CasterKind.UnsafeBypass)],
            ["background", caster(CasterKind.UnsafeBypass)],
            ["category", caster(CasterKind.UnsafeBypass)],
            ["unsetApplicationState", caster(CasterKind.UnsafeBypass)],
            ["applicationState", caster(CasterKind.UnsafeBypass)],
        ]),
        castErrorHandler: throwInvalid,
        authPolicy: authQueryFac(AuthQueryKind.Or)([
            authQueryFac(AuthQueryKind.IsAdmin)(),
            authQueryFac(AuthQueryKind.And)([
                authQueryFac(AuthQueryKind.IsGroupManageable)(authArgGet("groupId"))
            ]),
        ]),
        authErrorHandler: throwUnauth,
        uploadPaths: ["poster", "background"],
        businessLogic: bl.updateGroup,
    })),

    destroyGroup: ()=>throwNimpl(),
    // applyGroup: async (_: any, args: any, c: Context)=>{
    //     await applyGroup(
    //         c,
    //         new mongo.ObjectId(args.groupId),
    //         new mongo.ObjectId(args.userId),
    //     );
    // },
    applyGroup: gqlWrap(externReqHandler({
        caster: genObjCaster([
            ["groupId", caster(CasterKind.ToMongoId)],
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
        businessLogic: bl.applyGroup,
    })),
    // leaveGroup: async (_: any, args: any, c: Context)=>{
    //     await leaveGroup(
    //         c,
    //         new mongo.ObjectId(args.groupId),
    //         new mongo.ObjectId(args.userId),
    //     );
    // },
    leaveGroup: gqlWrap(externReqHandler({
        caster: genObjCaster([
            ["groupId", caster(CasterKind.ToMongoId)],
            ["userId", caster(CasterKind.ToMongoId)],
        ]),
        castErrorHandler: throwInvalid,
        authPolicy: authQueryFac(AuthQueryKind.Or)([
            authQueryFac(AuthQueryKind.IsAdmin)(),
            authQueryFac(AuthQueryKind.And)([
                authQueryFac(AuthQueryKind.IsTheUser)(authArgGet("userId")),
                authQueryFac(AuthQueryKind.IsGroupMember)(authArgGet("groupId")),
            ]),
        ]),
        authErrorHandler: throwUnauth,
        uploadPaths: [],
        businessLogic: bl.leaveGroup,
    })),
    // kickFromGroup: async (_: any, args: any, c: Context)=>{
    //     await leaveGroup(
    //         c,
    //         new mongo.ObjectId(args.groupId),
    //         new mongo.ObjectId(args.userId),
    //     );
    // },
    kickFromGroup: gqlWrap(externReqHandler({
        caster: genObjCaster([
            ["groupId", caster(CasterKind.ToMongoId)],
            ["userId", caster(CasterKind.ToMongoId)],
        ]),
        castErrorHandler: throwInvalid,
        authPolicy: authQueryFac(AuthQueryKind.Or)([
            authQueryFac(AuthQueryKind.IsAdmin)(),
            authQueryFac(AuthQueryKind.IsGroupManageable)(authArgGet("groupId")),
        ]),
        authErrorHandler: throwUnauth,
        uploadPaths: [],
        businessLogic: bl.leaveGroup,
    })),
    // updateMember: async (_: any, args: any, c: Context)=>{
    //     await updateMember(
    //         c,
    //         new mongo.ObjectId(args.groupId),
    //         new mongo.ObjectId(args.userId),
    //         args.newMemberKind,
    //     );
    // },
    updateMember: gqlWrap(externReqHandler({
        caster: genObjCaster([
            ["groupId", caster(CasterKind.ToMongoId)],
            ["userId", caster(CasterKind.ToMongoId)],
            ["newMemberKind", caster(CasterKind.UnsafeBypass)],
        ]),
        castErrorHandler: throwInvalid,
        authPolicy: authQueryFac(AuthQueryKind.Or)([
            authQueryFac(AuthQueryKind.IsAdmin)(),
            authQueryFac(AuthQueryKind.IsGroupManageable)(authArgGet("groupId")),
        ]),
        authErrorHandler: throwUnauth,
        uploadPaths: [],
        businessLogic: bl.updateMember,
    })),
    // succeedGroupOwner: async (_: any, args: any, c: Context)=>{
    //     await succeedGroupOwner(
    //         c,
    //         new mongo.ObjectId(args.groupId),
    //         new mongo.ObjectId(args.newOwnerId),
    //     );
    // },
    succeedGroupOwner: gqlWrap(externReqHandler({
        caster: genObjCaster([
            ["groupId", caster(CasterKind.ToMongoId)],
            ["newOwnerId", caster(CasterKind.ToMongoId)],
        ]),
        castErrorHandler: throwInvalid,
        authPolicy: authQueryFac(AuthQueryKind.Or)([
            authQueryFac(AuthQueryKind.IsAdmin)(),
            authQueryFac(AuthQueryKind.IsGroupManageable)(authArgGet("groupId")),
        ]),
        authErrorHandler: throwUnauth,
        uploadPaths: [],
        businessLogic: bl.succeedGroupOwner,
    })),


    // createGroupQna: async (_: any, args: any, c: Context)=> {
    //     const newArgs = {
    //         group: new mongo.ObjectId(args.groupId),
    //         author: new mongo.ObjectId(args.authorId),
    //         body: args.body,
    //     };
    //     const newId = await createGroupQna(c, newArgs);
    //     return {id: newId.toString()};
    // },
    createGroupQna: gqlWrap(externReqHandler({
        caster: genObjCaster([
            ["groupId", caster(CasterKind.ToMongoId)],
            ["authorId", caster(CasterKind.ToMongoId)],
            ["body", caster(CasterKind.UnsafeBypass)],
        ]),
        castErrorHandler: throwInvalid,
        authPolicy: authQueryFac(AuthQueryKind.Or)([
            authQueryFac(AuthQueryKind.IsAdmin)(),
            authQueryFac(AuthQueryKind.IsTheUser)(authArgGet("authorId")),
        ]),
        authErrorHandler: throwUnauth,
        uploadPaths: [],
        businessLogic: bl.createGroupQna,
    })),
    // updateGroupQna: async (_: any, args: any, c: Context)=> {
    //     const newArgs = {
    //         body: args.body,
    //     };
    //     await updateGroupQna(c, new mongo.ObjectId(args.qnaId), newArgs);
    // },
    updateGroupQna: gqlWrap(externReqHandler({
        caster: genObjCaster([
            ["qnaId", caster(CasterKind.ToMongoId)],
            ["body", caster(CasterKind.UnsafeBypass)],
        ]),
        castErrorHandler: throwInvalid,
        authPolicy: authQueryFac(AuthQueryKind.Or)([
            authQueryFac(AuthQueryKind.IsAdmin)(),
            authQueryFac(AuthQueryKind.IsGroupQnaAuthor)(authArgGet("qnaId")),
        ]),
        authErrorHandler: throwUnauth,
        uploadPaths: [],
        businessLogic: bl.updateGroupQna,
    })),
    destroyGroupQna: ()=>throwNimpl(),
    // answerGroupQna: async (_: any, args: any, c: Context)=> {
    //     const newArgs = {
    //         answer: args.answer,
    //     };
    //     await answerGroupQna(c, new mongo.ObjectId(args.qnaId), newArgs);
    // },
    answerGroupQna: gqlWrap(externReqHandler({
        caster: genObjCaster([
            ["qnaId", caster(CasterKind.ToMongoId)],
            ["answer", caster(CasterKind.UnsafeBypass)],
        ]),
        castErrorHandler: throwInvalid,
        authPolicy: authQueryFac(AuthQueryKind.Or)([
            authQueryFac(AuthQueryKind.IsAdmin)(),
            authQueryFac(AuthQueryKind.IsGroupOfQnaManageable)(authArgGet("qnaId")),
        ]),
        authErrorHandler: throwUnauth,
        uploadPaths: [],
        businessLogic: bl.answerGroupQna,
    })),


    // createGroupSchedule: async (_: any, args: any, c: Context)=> {
    //     const newArgs = {
    //         group: new mongo.ObjectId(args.groupId),
    //         title: args.title,
    //         date: args.date,
    //     };
    //     const newId = await createGroupSchedule(c, newArgs);
    //     return {id: newId.toString()};
    // },
    createGroupSchedule: gqlWrap(externReqHandler({
        caster: genObjCaster([
            ["groupId", caster(CasterKind.ToMongoId)],
            ["title", caster(CasterKind.UnsafeBypass)],
            ["date", caster(CasterKind.UnsafeBypass)],
            ["targets", caster(CasterKind.ToMongoIds)],
        ]),
        castErrorHandler: throwInvalid,
        authPolicy: authQueryFac(AuthQueryKind.Or)([
            authQueryFac(AuthQueryKind.IsAdmin)(),
            authQueryFac(AuthQueryKind.IsGroupManageable)(authArgGet("groupId")),
        ]),
        authErrorHandler: throwUnauth,
        uploadPaths: [],
        businessLogic: bl.createGroupSchedule,
    })),
    // updateGroupSchedule: async (_: any, args: any, c: Context)=>{
    //     await updateGroupSchedule(
    //         c,
    //         new mongo.ObjectId(args.scheduleId),
    //         {
    //             title: args.title,
    //             date: args.date,
    //         },
    //     );
    // },
    updateGroupSchedule: gqlWrap(externReqHandler({
        caster: genObjCaster([
            ["scheduleId", caster(CasterKind.ToMongoId)],
            ["title", caster(CasterKind.UnsafeBypass)],
            ["date", caster(CasterKind.UnsafeBypass)],
            ["target", emptiableCastWrap(caster(CasterKind.ToMongoIds))],
        ]),
        castErrorHandler: throwInvalid,
        authPolicy: authQueryFac(AuthQueryKind.Or)([
            authQueryFac(AuthQueryKind.IsAdmin)(),
            authQueryFac(AuthQueryKind.IsGroupOfScheduleManageable)(authArgGet("scheduleId")),
        ]),
        authErrorHandler: throwUnauth,
        uploadPaths: [],
        businessLogic: bl.updateGroupSchedule,
    })),
    destroyGroupSchedule: ()=>throwNimpl(),

    // createGroupNotice: async (_: any, args: any, c: Context)=> {
    //     const newId = await createGroupNotice(
    //         c,
    //         {
    //             group: new mongo.ObjectId(args.groupId),
    //             author: new mongo.ObjectId(args.authorId),
    //             isUrgent: args.isUrgent,
    //             title: args.title,
    //             body: args.body,
    //             files: await Promise.all(args.files.map(
    //                 (file: RawGraphqlUpload)=>gqlUpload(c, toGraphqlUpload(file))
    //             )),
    //             images: await Promise.all(args.images.map(
    //                 (image: RawGraphqlUpload)=>gqlUpload(c, toGraphqlUpload(image))
    //             )),
    //         },
    //     );
    //     return {id: newId.toString};
    // },
    createGroupNotice: gqlWrap(externReqHandler({
        caster: genObjCaster([
            ["groupId", caster(CasterKind.ToMongoId)],
            ["authorId", caster(CasterKind.ToMongoId)],
            ["isUrgent", caster(CasterKind.UnsafeBypass)],
            ["title", emptiableCastWrap(caster(CasterKind.UnsafeBypass))],
            ["body", emptiableCastWrap(caster(CasterKind.UnsafeBypass))],
            ["files", emptiableCastWrap(caster(CasterKind.UnsafeBypass))],
            ["images", emptiableCastWrap(caster(CasterKind.UnsafeBypass))],
        ]),
        castErrorHandler: throwInvalid,
        authPolicy: authQueryFac(AuthQueryKind.Or)([
            authQueryFac(AuthQueryKind.IsAdmin)(),
            authQueryFac(AuthQueryKind.IsGroupOfScheduleManageable)(authArgGet("scheduleId")),
        ]),
        authErrorHandler: throwUnauth,
        uploadPaths: ["files/#", "images/#"],
        businessLogic: bl.createGroupNotice,
    })),
    // updateGroupNotice: async (_: any, args: any, c: Context)=>{
    //     await updateGroupNotice(
    //         c,
    //         new mongo.ObjectId(args.noticeId),
    //         {
    //             isUrgent: args.isUrgent,
    //             title: args.title,
    //             body: args.body,
    //
    //             filesAdded: await Promise.all(args.filesAdded.map(
    //                 (file: RawGraphqlUpload)=>gqlUpload(c, toGraphqlUpload(file))
    //             )),
    //             imagesAdded: await Promise.all(args.imagesAdded.map(
    //                 (image: RawGraphqlUpload)=>gqlUpload(c, toGraphqlUpload(image))
    //             )),
    //             filesRemoved: args.filesRemoved,
    //             imagesRemoved: args.imagesRemoved,
    //         },
    //     );
    // },
    updateGroupNotice: gqlWrap(externReqHandler({
        caster: genObjCaster([
            ["noticeId", caster(CasterKind.ToMongoId)],
            ["isUrgent", caster(CasterKind.UnsafeBypass)],
            ["title", emptiableCastWrap(caster(CasterKind.UnsafeBypass))],
            ["body", emptiableCastWrap(caster(CasterKind.UnsafeBypass))],
            ["filesAdded", emptiableCastWrap(caster(CasterKind.UnsafeBypass))],
            ["filesRemoved", emptiableCastWrap(caster(CasterKind.UnsafeBypass))],
            ["imagesAdded", emptiableCastWrap(caster(CasterKind.UnsafeBypass))],
            ["imagesRemoved", emptiableCastWrap(caster(CasterKind.UnsafeBypass))],
        ]),
        castErrorHandler: throwInvalid,
        authPolicy: authQueryFac(AuthQueryKind.Or)([
            authQueryFac(AuthQueryKind.IsAdmin)(),
            authQueryFac(AuthQueryKind.IsGroupOfScheduleManageable)(authArgGet("scheduleId")),
        ]),
        authErrorHandler: throwUnauth,
        uploadPaths: ["filesAdded/#", "imagesAdded/#"],
        businessLogic: bl.updateGroupNotice,
    })),
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

