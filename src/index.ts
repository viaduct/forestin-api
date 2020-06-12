import * as apolloServer from "./init/graphql-express";

async function main()
{
    await apolloServer.init({
        port: 4410,
    });
}

main();
