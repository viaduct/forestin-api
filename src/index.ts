import * as apolloServer from "./init/graphql-express";
import * as mongoInit from "./init/mongo";
import * as awsInit from "./init/aws";
import * as awsS3ObjectGetInit from "./init/aws-s3-object-get";
import * as collectionNameMapInit from "./init/collection-name-map";
import * as dotenvInit from "./init/dotenv";

// import {tokenData} from "./defs/pre/TokenData";
import {signUp} from "./gql/mutations/sign-up";
import {CollecKind} from "./enums";
import {collecKindLen} from "./enums/CollecKind";
import {handler as userHandler} from "./gql/types/user";
import {handler as genderHandler} from "./gql/enums/gender";
import {GraphQLScalarType} from "graphql";

async function main()
{
    // Load Dotenv.
    const dotenvResult = await dotenvInit.init({});

    // Load DB collection name mapper.
    const collectionNameMapResult = await collectionNameMapInit.init({});

    // Load aws.
    const awsResult = await awsInit.init({});

    // Load mongo.
    const mongoResult = await mongoInit.init({
        url: process.env.ROLLOUT_MONGO_URL!,
        dbName: process.env.ROLLOUT_MONGO_DB_NAME!,
    });

    // Load Apollo.
    async function handleAuth({req}: any)
    {
        // Handle auth here...
        const authHeader = req.headers.authorization;
        if ( authHeader != null )
        {
            // const authData = await tokenData(process.env.ROLLOUT_PRIVATE_KEY!, authHeader);
            // return {user: authData};
            return {}; // todo, replace this meaningless into the upper 2 lines of code later.
        }
        else
        {
            return {};
        }
    }
    const graphqlExpressResult = await apolloServer.init({
        domain: process.env.ROLLOUT_DOMAIN!,
        port: Number(process.env.ROLLOUT_APOLLO_PORT!),
        context: {
            mongo: {
                db: mongoResult.db,
                collec: (colKind: CollecKind)=>{
                    const map = [
                        "User",
                        "StudentVerification",
                        "Group",
                        "GroupMember",
                        "Association",
                        "GroupHistory",
                        "GroupHistoryCmt",
                        "GroupHistoryLike",
                        "GroupQna",
                        "GroupSchedule",
                        "GroupBill",
                        "GroupVote",
                        "GroupNotice",
                        "ChatRoom",
                        "ChatMember",
                        "ChatMsg",
                    ];
                    console.assert(map.length == collecKindLen);
                    return mongoResult.db.collection(map[colKind]);
                },
            },
            s3: {
                s3: awsResult.s3,
                defaultBucketName: process.env.ROLLOUT_DEFAULT_S3_BUCKET_NAME!,
            },
            auth: {
                privateKey: process.env.ROLLOUT_PRIVATE_KEY!,
                tokenLifetime: process.env.ROLLOUT_LOGIN_TOKEN_LIFETIME!,
            },
        },
        contextInitializer: handleAuth,
        typeDefs: `
scalar TimeStamp

enum Gender
{
    MALE, FEMALE, OTHERS
}

type User
{
    id: ID!
    issuedDate: TimeStamp!
    name: String!
    email: String!
    birthday: String!
    phoneNumber: String!
    gender: Gender!
    primaryStudentVerification: ID
}

type Query 
{
    user(id: ID!): User!
}

type Mutation
{
    signUp(
        email: String!
        password: String!
        name: String!
        birthday: String!
        gender: Gender!
        phoneNumber: String!
    ): User!
}
        `, // todo
        resolvers: {
            User: userHandler,
            Query: {
                user: bypassId,
            },
            Mutation: {
                signUp: signUp,
            },
            TimeStamp: new GraphQLScalarType({
                name: "TimeStamp",
                description: "Millisecond-precision timestamp. Can be used to initialize via new Date(timestamp).",
                serialize: (value: Date): string=>{
                    return value.getTime().toString();
                },
                parseValue: (value: string): Date=>{
                    return new Date(Number(value));
                },
            }),
            Gender: genderHandler,
        }, // todo
    });

    // Load AWS S3 object getter.
    await awsS3ObjectGetInit.init({
        s3: awsResult.s3,
        expressApp: graphqlExpressResult.expressApp,
        sendErrorToClient: process.env.ROLLOUT_SEND_ERROR! == "true",
    });

    console.log("Done!");
}

main();

function bypassId(_: any, args: any): any
{
    return {id: args.id};
}
