import {GroupMemberKind} from "../../enums/GroupMemberKind";

export const resolver = {
    OWNER: GroupMemberKind.Owner,
    MANAGER: GroupMemberKind.Manager,
    NORMAL: GroupMemberKind.Normal,
    APPLICANT: GroupMemberKind.Applicant,
};
