import express from "express";
import {ApolloServer} from "apollo-server-express";
import depthLimit from "graphql-depth-limit";
import {createComplexityLimitRule} from "graphql-validation-complexity";
import {Context} from "../defs/pre/Context";
import http from "http";
import {assignOrDefault} from "../defs/pre/util";
import {root as graphqlRootSchema} from "../defs/post/graphqlSchema";

export interface ServerOptions
{
    port: number;
    domain: string;
    contextInitializer?: Function | null;
    context?: object | null;
}

export interface Server
{
    expressApp: any;
}

export async function init(options: ServerOptions): Promise<Server>
{
    console.log("Initializing the module graphql-express...");

    const contextInitializer = assignOrDefault(options.contextInitializer, ()=>{return {};});
    const givenContext = assignOrDefault(options.context, {});
    const port = options.port;
    const domain = options.domain;

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
    async function apolloServerInitContext(integration: any): Promise<Context>
    {
        return {
            ...givenContext,
            ...await contextInitializer(integration),
            // ... and add more context here, if required.
        } as Context;
    }
    // const context = apolloServerInitContext();

    const apolloServerInst = new ApolloServer({
        typeDefs: graphqlRootSchema.typeDefs,
        resolvers: graphqlRootSchema.resolvers,
        validationRules: apolloServerValidationRules,
        context: apolloServerInitContext,
    });

    apolloServerInst.applyMiddleware({
        app: expressApp,
        cors: {
            origin: "*",
            credentials: true,
        },
    });

    const httpServer = http.createServer(expressApp);
    httpServer.timeout = 5000;
    const serverPromise = new Promise((resolve)=>{
        httpServer.listen(
            {
                port: port,
            },
            ()=>{
                console.log(`The Graphql server is running at http(s)://${domain}:${port}${apolloServerInst.graphqlPath}`);
                resolve();
            },
        );
    });
    await serverPromise;

    return {
        expressApp: expressApp,
    };
}
