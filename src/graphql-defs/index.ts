import {aggregateTypes} from "../lib/Graphql";

import * as Upload from "./Upload";
import * as None from "./None";
import * as StaticDate from "./StaticDate";
import * as StudentVerificationState from "./StudentVerificationState";
import * as TimeStamp from "./TimeStamp";
import * as EmailState from "./EmailState";
import * as PasswordState from "./PasswordState";
import * as University from "./University";
import * as Campus from "./Campus";
import * as College from "./Colleges";
import * as Major from "./Major";
import * as Query from "./Query";
import * as User from "./User";
import * as StudentVerification from "./StudentVerification";
import * as Mutation from "./Mutation";

const result = aggregateTypes([
    Upload,
    None,
    StaticDate,
    StudentVerificationState,
    TimeStamp,
    EmailState,
    PasswordState,
    University,
    Campus,
    College,
    Major,
    User,
    Query,
    Mutation,
    StudentVerification,
]);

export const typeDefs = result.typeDefs;
export const resolvers = result.resolvers;
