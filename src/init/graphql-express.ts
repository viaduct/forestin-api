import express from "express";
import {ApolloServer} from "apollo-server-express";
import depthLimit from "graphql-depth-limit";
import {createComplexityLimitRule} from "graphql-validation-complexity";
import http from "http";

export interface ServerOptions
{
    port: number;
    domain: string;
    contextInitializer?: Function | null;
    context?: any | null;
    typeDefs: string;
    resolvers: any;
}

export interface Server
{
    expressApp: any;
}

export async function init(options: ServerOptions): Promise<Server>
{
    console.log("Initializing the module graphql-express...");

    const contextInitializer = options.contextInitializer || (()=>new Object());
    const givenContext = options.context || new Object();
    const port = options.port;
    const domain = options.domain;

    const expressApp = express();

    const apolloServerValidationRules = [
        depthLimit(5), // No more depth limit over 5.
        createComplexityLimitRule( // No too-complex queries.
            1000,
            {
                onCost: (cost: number)=>console.log("Query cost: " + cost + "."),
            }
        ),
    ];
    async function apolloServerInitContext(integration: any): Promise<any>
    {
        return {
            ...givenContext,
            ...await contextInitializer(integration),
            // ... and add more context here, if required.
        };
    }
    // const context = apolloServerInitContext();

    const apolloServerInst = new ApolloServer({
        typeDefs: options.typeDefs,
        resolvers: options.resolvers,
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
