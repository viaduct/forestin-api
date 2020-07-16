import {resolver as Mutation} from "./Mutation";
import {resolver as Query} from "./Query";
import {resolver as User} from "./User";
import {resolver as Gender} from "./Gender";
import {resolver as TimeStamp} from "./TimeStamp";
import {resolver as Upload} from "./Upload";
import {resolver as StudentVerificationState} from "./StudentVerificationState";

export const resolvers: any = {
    Mutation,
    Query,
    User,
    Gender,
    TimeStamp,
    Upload,
    StudentVerificationState,
};
