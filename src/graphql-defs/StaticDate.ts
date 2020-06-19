import {GraphqlKind} from "../lib/Graphql";
import {GraphQLScalarType} from "graphql";
import {jsDateToString, stringToJsDate} from "../lib/db";

export const kind = GraphqlKind.CustomScalar;
export const name = "StaticDate";
export const schema = "scalar StaticDate";

export const scalarHandler = new GraphQLScalarType({
    name: name,
    description: "Non-timezone considering, date-precision time-representing type. Initially introduced to represent birthday, but its usage may be expended more in the future.",
    serialize: a=>a,
    parseValue: a=>a,
});
