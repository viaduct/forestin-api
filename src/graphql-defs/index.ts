import {aggregateTypes} from "../lib/Graphql";

import * as Upload from "./Upload";
import * as Query from "./Query";

const result = aggregateTypes([
    Upload,
    Query,
]);

export const typeDefs = result.typeDefs;
export const resolvers = result.resolvers;
