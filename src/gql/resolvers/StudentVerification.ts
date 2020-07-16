import {createGqlFindField} from "../../failsafe";
import {CollecKind} from "../../enums";

export const resolver = {
    issuedDate: createGqlFindField(CollecKind.StudentVerification, "issuedDate"),
    user: createGqlFindField(CollecKind.StudentVerification, "user", true,),
    evidences: createGqlFindField(CollecKind.StudentVerification, "evidences"),
    majors: createGqlFindField(CollecKind.StudentVerification, "majors", true, true),
    admissionYear: createGqlFindField(CollecKind.StudentVerification, "admissionYear"),
    state: createGqlFindField(CollecKind.StudentVerification, "state"),
    confirmedDate: createGqlFindField(CollecKind.StudentVerification, "fixedDate"),
    rejectedDate: createGqlFindField(CollecKind.StudentVerification, "fixedDate"),
};
