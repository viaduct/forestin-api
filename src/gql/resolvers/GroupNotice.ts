import {createGqlFindField} from "../../failsafe";
import {CollecKind} from "../../enums";

export const resolver = {
    issuedDate: createGqlFindField(CollecKind.GroupNotice, "issuedDate"),
    lastModifiedAt: createGqlFindField(CollecKind.GroupNotice, "lastModifiedAt"),
    group: createGqlFindField(CollecKind.GroupNotice, "group", true),
    author: createGqlFindField(CollecKind.GroupNotice, "author", true),
    isUrgent: createGqlFindField(CollecKind.GroupNotice, "isUrgent"),
    title: createGqlFindField(CollecKind.GroupNotice, "title"),
    body: createGqlFindField(CollecKind.GroupNotice, "body"),
    files: createGqlFindField(CollecKind.GroupNotice, "files"),
    images: createGqlFindField(CollecKind.GroupNotice, "images"),
};
