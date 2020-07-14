import {GraphqlDef, mergeGraphqlDefs} from "../pre/actions/graphql-aggregate";
import {Context} from "../pre/Context";
import {
    confirmStudentVerification,
    refreshToken2, rejectStudentVerification,
    requestStudentVerification,
    signIn2,
    signUp2,
    updateUser
} from "../pre/actions/login";
import {fromOldContext} from "../pre/context-2/Context2";


const mutationDefs: GraphqlDef[] = [
    {
        typeDefs: `
            type Mutation
            {
                signIn(email: String!, password: String!): String!
                refreshSignInToken(token: String!): String!
                "signUp(email: String!, password: String!, passFormId: String!): None"
                signUp(
                    email: String!
                    password: String!
                    name: String!
                    birthday: String!
                    gender: Gender!
                    phoneNumber: String!
                ): User!
                updateUser(
                    userId: ID!
                    password: String!
                ): None
                updateUserAvatar(
                    userId: ID!
                    avatar: Upload
                ): None
                requestStudentVerification(
                    userId: ID, 
                    majors: [String!]!, 
                    admissionYear: String!, 
                    evidences: [Upload!]!
                ): StudentVerification!
                confirmStudentVerification(studentVerificationId: ID!): None
                rejectStudentVerification(StudentVerificationId: ID!): None
            }
        `,
        resolvers: {
            Mutation: {
                signIn: async (_: any, args: any, context: Context)=>{
                    return await signIn2(await fromOldContext(context), args);
                    // return await signIn(context, args.id, args.password);
                },
                refreshSignInToken: async (_: any, args: any, context: Context)=>{
                    return await refreshToken2(await fromOldContext(context), args);
                },
                signUp: async (_: any, args: any, context: Context)=>{
                    return await signUp2(
                        await fromOldContext(context),
                        args
                    );
                    // return await signUp(context, args.email, args.password, args.passFormId);
                },
                updateUser: async (_: any, args: any, context: Context)=>{
                    await updateUser(
                        await fromOldContext(context),
                        args
                    );
                },
                requestStudentVerification: async (_: any, args: any, context: Context)=>{
                    return await requestStudentVerification(
                        await fromOldContext(context),
                        args
                    );
                },
                confirmStudentVerification: async (_: any, args: any, context: Context)=>{
                    await confirmStudentVerification(
                        await fromOldContext(context),
                        args
                    );
                },
                rejectStudentVerification: async (_: any, args: any, context: Context)=>{
                    await rejectStudentVerification(
                        await fromOldContext(context),
                        args,
                    );
                }
                //     async (
                //     _: any,
                //     args: {
                //         userId: RawMongoId,
                //         majors: AssociationId[],
                //         admissionYear: Year2,
                //         evidences: RawGraphqlUpload,
                //     },
                //     context: Context,
                // )=>
                // {
                //     return await requestStudentVerification(
                //         context,
                //         new mongo.ObjectId(args.userId),
                //         args.majors,
                //         args.admissionYear,
                //         args.evidences,
                //     );
                // },
            },
        },
    },
];

export const mutation: GraphqlDef = mergeGraphqlDefs(mutationDefs);
