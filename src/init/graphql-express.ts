import express from "express";
import {ApolloServer} from "apollo-server-express";
import depthLimit from "graphql-depth-limit";
import {createComplexityLimitRule} from "graphql-validation-complexity";
import {Context} from "../lib/Context";
import {typeDefs, resolvers} from "../graphql-defs";
import http from "http";

export interface ServerOptions
{
    port: number;
    contextInitializer?: Function | null;
}

export interface Server
{
    expressApp: any;
    context: Context;
}

export async function init(options: ServerOptions): Promise<Server>
{
    if ( options.contextInitializer == null )
    {
        options.contextInitializer = ()=>{return {};};
    }

    const expressApp = express();

    const apolloServerValidationRules = [
        depthLimit(5), // No more depth limit over 5.
        createComplexityLimitRule( // No too-complex query.
            1000,
            {
                onCost: (cost: number)=>console.log("Query cost: " + cost + "."),
            }
        ),
    ];
    function apolloServerInitContext(): Context
    {
        return {
            ...options.contextInitializer!(),
            // Do some initialization in here...
        } as Context;
    }
    const context = apolloServerInitContext();

    const apolloServerInst = new ApolloServer({
        typeDefs: typeDefs,
        resolvers: resolvers,
        validationRules: apolloServerValidationRules,
        context: context,
    });

    apolloServerInst.applyMiddleware({
        app: expressApp,
        cors: {
            origin: "*",
            credentials: true,
        },
    });

    const port = options.port;
    const httpServer = http.createServer(expressApp);
    httpServer.timeout = 5000;
    const serverPromise = new Promise((resolve)=>{
        httpServer.listen(
            {
                port: port,
            },
            ()=>{
                console.log(`The Graphql server is running at http(s)://your-url.asdf:${port}${apolloServerInst.graphqlPath}`);
                resolve();
            },
        );
    });
    await serverPromise;

    return {
        expressApp: expressApp,
        context: context,
    };
}
