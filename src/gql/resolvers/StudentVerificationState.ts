import {StudentVerificationState} from "../../enums/StudentVerificationState";

export const resolver = {
    PENDED: StudentVerificationState.Pended,
    CONFIRMED: StudentVerificationState.Confirmed,
    REJECTED: StudentVerificationState.Rejected,
};
