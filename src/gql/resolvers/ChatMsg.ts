import {createGqlFindField} from "../../failsafe";
import {CollecKind} from "../../enums";

export const resolver = {
    issuedDate: createGqlFindField(CollecKind.ChatMsg, "issuedDate"),
    lastModifiedAt: createGqlFindField(CollecKind.ChatMsg, "lastModifiedAt"),
    chatRoom: createGqlFindField(CollecKind.ChatMsg, "chatRoom", true),
    author: createGqlFindField(CollecKind.ChatMsg, "author", true),
    body: createGqlFindField(CollecKind.ChatMsg, "body"),
};
