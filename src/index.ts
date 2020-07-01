import * as apolloServer from "./init/graphql-express";
import * as mongoInit from "./init/mongo";
import * as awsInit from "./init/aws";
import * as awsS3ObjectGetInit from "./init/aws-s3-object-get";
import * as collectionNameMapInit from "./init/collection-name-map";
import * as dotenvInit from "./init/dotenv";

import {tokenData} from "./defs/pre/login";

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
            const authData = await tokenData(process.env.ROLLOUT_PRIVATE_KEY!, authHeader);
            return {user: authData};
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
            s3: awsResult.s3,
            db: mongoResult.db,
            collectionNameMap: collectionNameMapResult.findName,
            defaultS3BucketName: process.env.ROLLOUT_DEFAULT_S3_BUCKET_NAME!,
            privateKey: process.env.ROLLOUT_PRIVATE_KEY!,
            tokenLifetime: process.env.ROLLOUT_LOGIN_TOKEN_LIFETIME!,
        },
        contextInitializer: handleAuth,
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
