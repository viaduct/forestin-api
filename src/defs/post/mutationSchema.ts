import {GraphqlDef} from "../pre/new-graphql";
import {mergeGraphqlDefs} from "../pre/new-graphql";
import {Context} from "../pre/Context";
import {toGraphqlUpload} from "../pre/graphql-upload";
import {signInWithContext, refreshTokenWithContext, signUpWithContext} from "../login";

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
                    return await signInWithContext(context, args.id, args.password);
                },
                refreshSignInToken: async (_: any, args: {token: string}, context: Context)=>{
                    return await refreshTokenWithContext(context, args.token);
                },
                signUp: async (_: any, args: {email: string, password: string, passFormId: string}, context: Context)=>{
                    return await signUpWithContext(context, args.email, args.password, args.passFormId);
                },
                requestStudentVerification: async (
                    _: any,
                    args: {
                        userId: string,
                        majors: string[],
                        admissionYear: string,
                        evidences_: any /* raw graphql upload */,
                    },
                    context: Context,
                )=> {
                    const evidences = args.evidences_.map(toGraphqlUpload);
                    const {userId, majors, admissionYear} = args;

                    // TODO
                    throw new Error("Not yet implemented.");
                }
            },
        },
    },
];

export const mutation: GraphqlDef = mergeGraphqlDefs(mutationDefs);
