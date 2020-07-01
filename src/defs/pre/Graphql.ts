// import {GraphQLScalarType} from "graphql";

// export enum GraphqlKind
// {
//     CustomScalar,
//     Type,
//     Interface,
//     Input,
//     Enum,
// }
//
// export interface Type
// {
//     kind: GraphqlKind;
//     name: string;
//     schema: string;
//     handlers?: Handler[]; // For only kind == Graphql.Type | Interface
//     scalarHandler?: GraphQLScalarType; // For only kind == GraphqlKind.CustomScalar
//     enumHandler?: object; // For only kind == GraphqlKind.Enum
// }
//
// export interface TypeAggregationResult
// {
//     typeDefs: string;
//     resolvers: any;
// }
//
// const nullTypeAggregation: TypeAggregationResult = {
//     typeDefs: "",
//     resolvers: {},
// };
//
// export interface Handler
// {
//     name: string;
//     handler: Function;
// }
//
// export function aggregateHandlers(handlers: Handler[], result: any = {}): any
// {
//     if ( handlers.length != 0 )
//     {
//         const [handler, ...handlerTail] = handlers;
//         return aggregateHandlers(
//             handlerTail,
//             {
//                 ...result,
//                 [handler.name]: handler.handler,
//             },
//         );
//     }
//     else { return result; }
// }
//
// function aggregateResolversIfExists(type: Type, resolvers: any)
// {
//     switch ( type.kind )
//     {
//         case GraphqlKind.Type:
//         case GraphqlKind.Interface:
//             console.assert(type.handlers != null);
//             return {
//                 ...resolvers,
//                 [type.name]: aggregateHandlers(type.handlers!), // Type, Interface must have handlers.
//             };
//         case GraphqlKind.CustomScalar:
//             return {
//                 ...resolvers,
//                 [type.name]: type.scalarHandler, // CustomScalar must have scalarHandler.
//             }
//         case GraphqlKind.Enum:
//             if ( type.enumHandler != null ) // Different from Type, Interface, and CustomScalar, Enum may not have enumHandler.
//             {
//                 return {
//                     ...resolvers,
//                     [type.name]: type.enumHandler,
//                 };
//             }
//             else
//             {
//                 return resolvers;
//             }
//         default:
//             return resolvers;
//     }
// }
//
// export function aggregateTypes(types: Type[], result: TypeAggregationResult = nullTypeAggregation): TypeAggregationResult
// {
//     if ( types.length != 0 )
//     {
//         const [type, ...typeTail] = types;
//         return aggregateTypes(
//             typeTail,
//             {
//                 typeDefs: result.typeDefs + type.schema,
//                 resolvers: aggregateResolversIfExists(type, result.resolvers),
//             },
//         );
//     }
//     else { return result; }
// }

