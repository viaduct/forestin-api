import {GraphqlDef} from "../pre/actions/graphql-aggregate";
import {mergeGraphqlDefs} from "../pre/actions/graphql-aggregate";
import {Context} from "../pre/Context";
import {RawGraphqlUpload, toGraphqlUpload} from "../pre/GraphqlUpload";
import {signIn, refreshToken, signUp, requestStudentVerification} from "../pre/actions/login";
import {AssociationId, RawMongoId, Year2} from "../pre/simple-types";
import mongo from "mongodb";

const mutationDefs: GraphqlDef[] = [
    {
        typeDefs: `
            type Mutation
            {
                signIn(id: String!, password: String!): String!
                refreshSignInToken(token: String!): String!
                signUp(email: String!, password: String!, passFormId: String!): None
                requestStudentVerification(userId: ID, majors: [String!]!, admissionYear: String!, evidences: [Upload!]!): None
            }
        `,
        resolvers: {
            Mutation: {
                signIn: async (_: any, args: {id: string, password: string}, context: Context)=>{
                    return await signIn(context, args.id, args.password);
                },
                refreshSignInToken: async (_: any, args: {token: string}, context: Context)=>{
                    return await refreshToken(context, args.token);
                },
                signUp: async (_: any, args: {email: string, password: string, passFormId: string}, context: Context)=>{
                    return await signUp(context, args.email, args.password, args.passFormId);
                },
                requestStudentVerification: async (
                    _: any,
                    args: {
                        userId: RawMongoId,
                        majors: AssociationId[],
                        admissionYear: Year2,
                        evidences: RawGraphqlUpload,
                    },
                    context: Context,
                )=>
                {
                    return await requestStudentVerification(
                        context,
                        new mongo.ObjectId(args.userId),
                        args.majors,
                        args.admissionYear,
                        args.evidences,
                    );
                },
            },
        },
    },
];

export const mutation: GraphqlDef = mergeGraphqlDefs(mutationDefs);
