import {createGqlFindField} from "../../failsafe";
import {CollecKind} from "../../enums";

export const resolver = {
    issuedDate: createGqlFindField(CollecKind.GroupHistory, "issuedDate"),
    lastModifiedAt: createGqlFindField(CollecKind.GroupHistory, "lastModifiedAt"),
    group: createGqlFindField(CollecKind.GroupHistory, "group", true),
    author: createGqlFindField(CollecKind.GroupHistory, "author", true),
    state: createGqlFindField(CollecKind.GroupHistory, "state"),
    title: createGqlFindField(CollecKind.GroupHistory, "title"),
    body: createGqlFindField(CollecKind.GroupHistory, "body"),
    images: createGqlFindField(CollecKind.GroupHistory, "images"),
};
