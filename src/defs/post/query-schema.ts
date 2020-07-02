import {GraphqlDef, mergeGraphqlDefs} from "../pre/actions/graphql-aggregate";
import {Context} from "../pre/Context";
import {signUpEmailCheck, signUpPasswordCheck} from "../pre/actions/login";

const queryDefs: GraphqlDef[] = [
    {
        typeDefs: `
            type Query
            {
                signUpEmailCheck(email: String!): EmailState!
                signUpPasswordCheck(password: String!): PasswordState!
                user(userId: ID): User!
            }
        `,
        resolvers: {
            Query: {
                signUpEmailCheck: async (_: any, args: {email: string}, context: Context)=>{
                    return await signUpEmailCheck(context, args.email);
                },
                signUpPasswordCheck: async (_: any, args: {password: string}, context: Context)=>{
                    return signUpPasswordCheck(args.password);
                },
                user: async (_: any, args: {userId: string}, context: Context)=>{
                    return {id: args.userId};
                },
            },
        },
    },
];

export const query: GraphqlDef = mergeGraphqlDefs(queryDefs);
