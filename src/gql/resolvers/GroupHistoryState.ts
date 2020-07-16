import {GroupHistoryState} from "../../enums/GroupHistoryState";

export const resolver = {
    PRIVATE: GroupHistoryState.Private,
    PENDING_PUBLIC_APPROVAL: GroupHistoryState.PendingPublicApproval,
    PUBLIC: GroupHistoryState.Public,
};
