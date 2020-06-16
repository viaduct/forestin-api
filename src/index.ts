import * as apolloServer from "./init/graphql-express";
import * as mongoInit from "./init/mongo";
import * as awsInit from "./init/aws";
import * as dotenvInit from "./init/dotenv";
import * as awsS3ObjectGetInit from "./init/aws-s3-object-get";

async function main()
{
    // Load Dotenv.
    const dotenvResult = await dotenvInit.init({});

    // Load aws.
    const awsResult = await awsInit.init({});

    // Load mongo.
    const mongoResult = await mongoInit.init({
        url: process.env.ROLLOUT_MONGO_URL!,
        dbName: process.env.ROLLOUT_MONGO_DB_NAME!,
    });

    // Load Apollo.
    const graphqlExpressResult = await apolloServer.init({
        domain: process.env.ROLLOUT_DOMAIN!,
        port: Number(process.env.ROLLOUT_APOLLO_PORT),
        context: {
            s3: awsResult.s3,
            db: mongoResult.db,
        },
    });

    // Load AWS S3 object getter.
    await awsS3ObjectGetInit.init({
        s3: awsResult.s3,
        expressApp: graphqlExpressResult.expressApp,
    });
}

main();
