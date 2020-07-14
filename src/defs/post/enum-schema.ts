import {GraphqlDef, mergeGraphqlDefs} from "../pre/actions/graphql-aggregate";
import {
    createDictForStudentVerificationState,
    StudentVerificationStateCol
} from "../pre/enums/StudentVerificationState";
import {createDictForPasswordState, PasswordStateCol} from "../pre/enums/PasswordState";
import {createDictForEmailState, EmailStateCol} from "../pre/enums/EmailState";
import {graphqlEnumDef} from "../pre/actions/enum";
import {createDictForGender, GenderCol} from "../pre/enums/Gender";

const defs: GraphqlDef[] = [
    graphqlEnumDef(
        "student verification state",
        [
            "pending",
            "verified",
            "rejected",
        ],
        createDictForStudentVerificationState(
            StudentVerificationStateCol.Name,
            StudentVerificationStateCol.Kind
        ),
    ),
    graphqlEnumDef(
        "password state",
        [
            "valid",
            "no digit",
            "no latin alphabet",
            "too short",
        ],
        createDictForPasswordState(
            PasswordStateCol.Name,
            PasswordStateCol.Kind,
        ),
    ),
    graphqlEnumDef(
        "email state",
        ["new", "used", "invalid"],
        createDictForEmailState(
            EmailStateCol.Name,
            EmailStateCol.Kind,
        ),
    ),
    graphqlEnumDef(
        "gender",
        ["male", "female", "others"],
        createDictForGender(
            GenderCol.Name,
            GenderCol.Kind,
        ),
    )
];

export const graphqlEnum: GraphqlDef = mergeGraphqlDefs(defs);


