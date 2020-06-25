import express from "express";
import {ApolloServer} from "apollo-server-express";
import depthLimit from "graphql-depth-limit";
import {createComplexityLimitRule} from "graphql-validation-complexity";
import {Context} from "../lib/Context";
import {typeDefs, resolvers} from "../graphql-defs";
import http from "http";
import {assignOrDefault} from "../lib/util";

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
        typeDefs: typeDefs,
        resolvers: resolvers,
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
