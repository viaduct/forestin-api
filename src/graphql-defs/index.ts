import {aggregateTypes} from "../lib/Graphql";

import * as Upload from "./Upload";
import * as None from "./None";
import * as StaticDate from "./StaticDate";
import * as StudentVerificationState from "./StudentVerificationState";
import * as TimeStamp from "./TimeStamp";
import * as EmailState from "./EmailState";
import * as PasswordState from "./PasswordState";
import * as Query from "./Query";
import * as Mutation from "./Mutation";

const result = aggregateTypes([
    Upload,
    None,
    StaticDate,
    StudentVerificationState,
    TimeStamp,
    EmailState,
    PasswordState,
    Query,
    Mutation,
]);

export const typeDefs = result.typeDefs;
export const resolvers = result.resolvers;
