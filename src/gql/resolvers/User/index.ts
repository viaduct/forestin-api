import {createGqlFindField} from "../../../failsafe";
import {CollecKind} from "../../../enums";

export const resolver = {
    issuedDate: createGqlFindField(CollecKind.User, "issuedDate"),
    name: createGqlFindField(CollecKind.User, "name"),
    email: createGqlFindField(CollecKind.User, "email"),
    birthday: createGqlFindField(CollecKind.User, "birthday"),
    phoneNumber: createGqlFindField(CollecKind.User, "phoneNumber"),
    gender: createGqlFindField(CollecKind.User, "gender"),
    primaryStudentVerification: createGqlFindField(CollecKind.User, "primaryStudentVerification", true),
}
