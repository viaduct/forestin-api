import {bypassId} from "../../../bl2";
import {CollecKind} from "../../../enums";

export const resolver = {
    user: bypassId(CollecKind.User),
    groupBill: bypassId(CollecKind.GroupBill),
    group: bypassId(CollecKind.Group),
    groupVote: bypassId(CollecKind.GroupVote),
    chatRoom: bypassId(CollecKind.ChatRoom),
    chatMsg: bypassId(CollecKind.ChatMsg),
    groupSchedule: bypassId(CollecKind.GroupSchedule),
    groupNotice: bypassId(CollecKind.GroupNotice),
    groupHistory: bypassId(CollecKind.GroupHistory),
    groupQna: bypassId(CollecKind.GroupQna),
};
