import {Context} from "../../../context";
import {
    createStudentVerification,
    findUserByEmailPassword,
    fixStudentVerification,
    signUp as biSignUp,
    updateUser
} from "../../../bl";
import {createTokenFromEmailPassword, refreshToken} from "../../../login-token";
import mongo from "mongodb";
import {throwNimpl} from "../../../errors";
import {RawGraphqlUpload, toGraphqlUpload} from "../../../graphql-upload";
import {gqlUpload} from "../../../s3";

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
}
