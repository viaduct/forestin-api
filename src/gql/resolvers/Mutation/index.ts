import {Context} from "../../../context";
import {
    answerGroupQna,
    applyGroup,
    createGroup, createGroupQna, createGroupSchedule,
    createStudentVerification,
    findUserByEmailPassword,
    fixStudentVerification,
    leaveGroup,
    signUp as biSignUp,
    succeedGroupOwner,
    updateGroup, updateGroupQna, updateGroupSchedule,
    updateMember,
    updateUser
} from "../../../bl";
import {createTokenFromEmailPassword, refreshToken} from "../../../login-token";
import mongo from "mongodb";
import {throwNimpl} from "../../../errors";
import {RawGraphqlUpload, toGraphqlUpload} from "../../../graphql-upload";
import {gqlUpload} from "../../../s3";
import {convUnset, emptyWrap} from "../util";

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
};

