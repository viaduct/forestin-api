import {GraphqlKind} from "../lib/Graphql";
import {GraphQLUpload} from "graphql-upload";

export const kind = GraphqlKind.CustomScalar;
export const name = "Upload";
export const schema = "";
export const scalarHandler = GraphQLUpload;
