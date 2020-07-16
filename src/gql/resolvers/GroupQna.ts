import {createGqlFindField} from "../../failsafe";
import {CollecKind} from "../../enums";

export const resolver = {
    issuedDate: createGqlFindField(CollecKind.GroupQna, "issuedDate"),
    group: createGqlFindField(CollecKind.GroupQna, "group", true),
    author: createGqlFindField(CollecKind.GroupQna, "author", true),
    body: createGqlFindField(CollecKind.GroupQna, "body"),
    answer: createGqlFindField(CollecKind.GroupQna, "answer"),
};
