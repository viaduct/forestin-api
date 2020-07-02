import {GraphqlDef, mergeGraphqlDefs} from "../pre/actions/graphql-aggregate";
import {GraphQLUpload} from "graphql-upload";
import {GraphQLScalarType} from "graphql";
import {user} from "./user-schema";
import {mutation} from "./mutation-schema";
import {query} from "./query-schema";
import {studentVerification} from "./student-verification-schema";
import {association} from "./association-schema";
import {graphqlEnum} from "./enum-schema";
import {jsDateToString, stringToJsDate} from "../pre/actions/date-cast";

const rootDefs: GraphqlDef[] = [
    {
        typeDefs: "enum None { NONE }",
        resolvers: {},
    },
    {
        typeDefs: "",
        resolvers: {
            Upload: GraphQLUpload
        },
    },
    {
        typeDefs: "scalar StaticDate",
        resolvers: {
            StaticDate: new GraphQLScalarType({
                name: "StaticDate",
                description: "Non-timezone considering, date-precision time-representing type. Initially introduced to represent birthday, but its usage may be expended more in the future.",
                serialize: a=>a,
                parseValue: a=>a,
            }),
        },
    },
    {
        typeDefs: `
            scalar TimeStamp
        `,
        resolvers: {
            TimeStamp: new GraphQLScalarType({
                name: "TimeStamp",
                description: "Millisecond-precision timestamp. Can be used to initialize via new Date(timestamp).",
                serialize: (value: Date): string=>{
                    return jsDateToString(value);
                },
                parseValue: (value: string): Date=>{
                    return stringToJsDate(value);
                },
            }),
        },
    },
];

export const root: GraphqlDef = mergeGraphqlDefs(
    [mergeGraphqlDefs(rootDefs), user, mutation, query, studentVerification, association, graphqlEnum],
);
