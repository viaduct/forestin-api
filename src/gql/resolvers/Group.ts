import {createGqlFindField} from "../../failsafe";
import {CollecKind} from "../../enums";

export const resolver = {
    issuedDate: createGqlFindField(CollecKind.Group, "issuedDate"),
    owner: createGqlFindField(CollecKind.Group, "owner", true),
    name: createGqlFindField(CollecKind.Group, "name"),
    brief: createGqlFindField(CollecKind.Group, "brief"),
    introduction: createGqlFindField(CollecKind.Group, "introduction"),
    isSchool: createGqlFindField(CollecKind.Group, "isSchool"),
    association: createGqlFindField(CollecKind.Group, "association", true),
    poster: createGqlFindField(CollecKind.Group, "poster"),
    background: createGqlFindField(CollecKind.Group, "background"),
    category: createGqlFindField(CollecKind.Group, "category", true),
    applicationState: createGqlFindField(CollecKind.Group, "applicationState"),
};
