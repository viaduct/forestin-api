import {GraphqlKind} from "../lib/Graphql";
import {GraphQLScalarType} from "graphql";
import {jsDateToString, stringToJsDate} from "../lib/db";

export const kind = GraphqlKind.CustomScalar;
export const name = "TimeStamp";
export const schema = "scalar TimeStamp";

export const scalarHandler = new GraphQLScalarType({
    name: name,
    description: "Millisecond-precision timestamp. Can be used to initialize via new Date(timestamp).",
    serialize: (value: Date): string=>{
        return jsDateToString(value);
    },
    parseValue: (value: string): Date=>{
        return stringToJsDate(value);
    }
});
