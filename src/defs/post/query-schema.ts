import {GraphqlDef, mergeGraphqlDefs} from "../pre/actions/graphql-aggregate";
import {Context} from "../pre/Context";
import {signUpEmailCheck, signUpPasswordCheck, studentVerificationsOfUser} from "../pre/actions/login";
import {fromOldContext} from "../pre/context-2/Context2";
import {CollectionKind} from "../pre/enums/CollectionKind";
import {vldRawMongoId} from "../pre/vld";
import mongo from "mongodb";
import {RawMongoId} from "../pre/simple-types";

const queryDefs: GraphqlDef[] = [
    {
        typeDefs: `
            type Query
            {
                signUpEmailCheck(email: String!): EmailState!
                signUpPasswordCheck(password: String!): PasswordState!
                user(userId: ID!): User!
                members(groupId: ID!): [User!]!
                studentVerification(studentVerificationId: ID!): StudentVerification!
                studentVerificationsOfUser(userId: ID!): [StudentVerification!]!
                group(groupId: ID!): Group!
                groups(keywords: String!): [Group!]!
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
                members: async (_: any, args: {groupId: string}, context: Context)=>{
                    const c2 = await fromOldContext(context);

                    // Validate parameters.
                    const vlds = [
                        [
                            vldRawMongoId(args.groupId),
                            ()=>({
                                kind: "INVALID",
                                invalidFieldName: "group id",
                            }),
                        ],
                    ];
                    const failedVlds = vlds.filter(([vld, errFac])=>!(vld as any).isPassed);
                    if ( failedVlds.length != 0 )
                    {
                        throw (failedVlds[0] as any)[1]();
                    }

                    // Get list of users.
                    const userIds = await c2.mongo.collec(CollectionKind.GroupMember)
                        .find({group: args})
                        .project({_id: 0, user: 1})
                        .toArray();

                    return userIds.map((id: mongo.ObjectId)=>({id: id.toString()}));
                },
                studentVerification: async (_: any, args: {studentVerificationId: string}, c: Context)=>{
                    return {id: args.studentVerificationId};
                },
                studentVerificationsOfUser: async (_: any, args: {userId: string}, c: Context)=>{
                    return await studentVerificationsOfUser(
                        await fromOldContext(c),
                        args,
                    );
                },
                group: async (_: any, args: {groupId: RawMongoId}, c: Context)=>{
                    return
                }
            },
        },
    },
];

export const query: GraphqlDef = mergeGraphqlDefs(queryDefs);
