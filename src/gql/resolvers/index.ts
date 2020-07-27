import {resolver as Mutation} from "./Mutation";
import {resolver as Query} from "./Query";
import {resolver as User} from "./User";
import {resolver as Category} from "./Category";
import {resolver as ChatHostKind} from "./ChatHostKind";
import {resolver as ChatMsg} from "./ChatMsg";
import {resolver as ChatRoom} from "./ChatRoom";
import {resolver as Gender} from "./Gender";
import {resolver as Group} from "./Group";
import {resolver as GroupBill} from "./GroupBill";
import {resolver as GroupHistory} from "./GroupHistory";
import {resolver as GroupHistoryCmt} from "./GroupHistoryCmt";
import {resolver as GroupHistoryState} from "./GroupHistoryState";
import {resolver as GroupMemberKind} from "./GroupMemberKind";
import {resolver as GroupNotice} from "./GroupNotice";
import {resolver as GroupQna} from "./GroupQna";
import {resolver as GroupSchedule} from "./GroupSchedule";
import {resolver as GroupVote} from "./GroupVote";
import {resolver as StudentVerification} from "./StudentVerification";
import {resolver as StudentVerificationState} from "./StudentVerificationState";
import {resolver as TimeStamp} from "./TimeStamp";
import {resolver as Upload} from "./Upload";

export const resolvers: any = {
    Mutation,
    Query,
    User,
    Category,
    ChatHostKind,
    ChatMsg,
    ChatRoom,
    Gender,
    Group,
    GroupBill,
    GroupHistory,
    GroupHistoryCmt,
    GroupHistoryState,
    GroupMemberKind,
    GroupNotice,
    GroupQna,
    GroupSchedule,
    GroupVote,
    StudentVerification,
    StudentVerificationState,
    TimeStamp,
    Upload,
};
