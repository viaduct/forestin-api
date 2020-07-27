import {createGqlFindField} from "../../failsafe";
import {CollecKind} from "../../enums";

export const resolver = {
    issuedDate: createGqlFindField(CollecKind.ChatRoom, "issuedDate"),
    title: createGqlFindField(CollecKind.ChatRoom, "title"),
    host: createGqlFindField(CollecKind.ChatRoom, "host"),
};
