import * as apolloServer from "./init/graphql-express";
import * as mongoInit from "./init/mongo";
import * as awsInit from "./init/aws";
import * as awsS3ObjectGetInit from "./init/aws-s3-object-get";
import * as collectionNameMapInit from "./init/collection-name-map";
import * as dotenvInit from "./init/dotenv";

// import {tokenData} from "./defs/pre/TokenData";
import {CollecKind} from "./enums";
import {collecKindLen} from "./enums/CollecKind";
import {typeDefs} from "./gql/typeDefs";
import {resolvers} from "./gql/resolvers";
import {ContextualTokenDataKind} from "./context";
import {parseToken} from "./login-token";

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
        // todo OK, don't do this. This is auth initializer.
        const nowTime = new Date(Date.now());
        return {
            contextualTokenData: {
                tokenData: {
                    kind: ContextualTokenDataKind.Admin
                }
            },
            now: {
                now: ()=>nowTime
            },
        };
    }
    const multipleContextInitializer = ({req}: any)=>{
        function aggr(mess: any, cur: any)
        {
            return cur(mess);
        }
        const fns: Function[] = [
            // Set now.
            (mess: any)=>{
                const nowTime = new Date(Date.now());
                return {
                    ...mess,
                    now: {
                        now: ()=>nowTime,
                    },
                };
            },
            // Parse auth token.
            (mess: any)=>{
                // Handle auth here...
                const authHeader = req.headers.authorization;
                if ( authHeader != null )
                {
                    let authData: any = null;
                    try
                    {
                        authData = parseToken(process.env.ROLLOUT_PRIVATE_KEY!, authHeader);
                    }
                    catch
                    {
                        console.error("Invalid token leads to Unauthorized context.");
                        return {
                            ...mess,
                            contextualTokenData: {
                                tokenData: {
                                    kind: ContextualTokenDataKind.Unauthorized,
                                },
                            },
                        };
                    }
                    return {
                        ...mess,
                        contextualTokenData: {
                            // tokenData: {
                            //     kind: ContextualTokenDataKind.Admin
                            // },
                            tokenData: {
                                kind: ContextualTokenDataKind.User,
                                userId: authData.id,
                            },
                        },
                    };
                }
                else
                {
                    return {
                        ...mess,
                        contextualTokenData: {
                            tokenData: {
                                kind: ContextualTokenDataKind.Unauthorized,
                            },
                        },
                    };
                }
            },
        ];
        return fns.reduce(aggr, {});
    };

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
        contextInitializer: multipleContextInitializer,
        typeDefs: typeDefs,
        resolvers: resolvers,
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

