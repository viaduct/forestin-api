import {createGqlFindField} from "../../failsafe";
import {CollecKind} from "../../enums";

export const resolver = {
    history: createGqlFindField(CollecKind.GroupHistoryCmt, "history", true),
    issuedDate: createGqlFindField(CollecKind.GroupHistoryCmt, "issuedDate"),
    lastModifiedAt: createGqlFindField(CollecKind.GroupHistoryCmt, "lastModifiedAt"),
    author: createGqlFindField(CollecKind.GroupHistoryCmt, "author", true),
    body: createGqlFindField(CollecKind.GroupHistoryCmt, "body"),
};
