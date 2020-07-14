import {HasIssuedDate, HasMongoId} from "./bases";
import {AssociationId, S3Key} from "../simple-types";
import {StudentVerificationState} from "../enums/StudentVerificationState";
import mongo from "mongodb";

export interface StudentVerification extends HasMongoId, HasIssuedDate
{
    user: mongo.ObjectId;
    majors: AssociationId[];
    evidences: S3Key[];
    state: StudentVerificationState;
    fixedDate?: Date;
}
