import {GraphQLScalarType} from "graphql";

export const resolver = new GraphQLScalarType({
    name: "TimeStamp",
    description: "Millisecond-precision timestamp. Can be used to initialize via new Date(timestamp).",
    serialize: (value: Date): string=>{
        return value.getTime().toString();
    },
    parseValue: (value: string): Date=>{
        return new Date(Number(value));
    },
});
