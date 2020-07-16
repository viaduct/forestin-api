import {resolver as Mutation} from "./Mutation";
import {resolver as Query} from "./Query";
import {resolver as User} from "./User";
import {resolver as Category} from "./Category";
import {resolver as Gender} from "./Gender";
import {resolver as Group} from "./Group";
import {resolver as GroupHistoryState} from "./GroupHistoryState";
import {resolver as GroupMemberKind} from "./GroupMemberKind";
import {resolver as StudentVerification} from "./StudentVerification";
import {resolver as StudentVerificationState} from "./StudentVerificationState";
import {resolver as TimeStamp} from "./TimeStamp";
import {resolver as Upload} from "./Upload";

export const resolvers: any = {
    Mutation,
    Query,
    User,
    Category,
    Gender,
    Group,
    GroupHistoryState,
    GroupMemberKind,
    StudentVerification,
    StudentVerificationState,
    TimeStamp,
    Upload,
};
