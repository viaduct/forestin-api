import {createGqlFindField} from "../../failsafe";
import {CollecKind} from "../../enums";

export const resolver = {
    issuedDate: createGqlFindField(CollecKind.GroupBill, "issuedDate"),
    lastModifiedAt: createGqlFindField(CollecKind.GroupBill, "lastModifiedAt"),
    group: createGqlFindField(CollecKind.GroupBill, "group", true),
    author: createGqlFindField(CollecKind.GroupBill, "author", true),
    targets: createGqlFindField(CollecKind.GroupBill, "author", true, true),
    amount: createGqlFindField(CollecKind.GroupBill, "amount"),
    targetsPaid: createGqlFindField(CollecKind.GroupBill, "targetsPaid", true, true),
    title: createGqlFindField(CollecKind.GroupBill, "title"),
    body: createGqlFindField(CollecKind.GroupBill, "body"),
    deadline: createGqlFindField(CollecKind.GroupBill, "deadline"),
    receivingAccount: createGqlFindField(CollecKind.GroupBill, "receivingAccount"),
    kakaoUrl: createGqlFindField(CollecKind.GroupBill, "kakaoUrl"),
    tossUrl: createGqlFindField(CollecKind.GroupBill, "tossUrl"),
    isClosed: createGqlFindField(CollecKind.GroupBill, "isClosed"),
};
