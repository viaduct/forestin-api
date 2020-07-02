import {HasIssuedDate, HasLastModifiedAt, HasMongoId} from "./bases";
import {AssociationId, S3Key} from "../simple-types";
import {StudentVerificationState} from "../enums/StudentVerificationState";

export interface StudentVerification extends HasMongoId, HasIssuedDate
{
    majors: AssociationId[];
    evidences: S3Key[];
    state: StudentVerificationState;
    verifiedDate?: Date;
    rejectedDate?: Date;
}
