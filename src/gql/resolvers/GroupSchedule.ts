import {createGqlFindField} from "../../failsafe";
import {CollecKind} from "../../enums";

export const resolver = {
    group: createGqlFindField(CollecKind.GroupSchedule, "group", true),
    title: createGqlFindField(CollecKind.GroupSchedule, "title"),
    date: createGqlFindField(CollecKind.GroupSchedule, "date"),
};
