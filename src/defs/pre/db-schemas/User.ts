import {DayPrecDate, Email, PhoneNumber, UserName} from "../simple-types";
import {StudentVerification} from "./StudentVerification";
import {Gender} from "../enums/Gender";
import {HasIssuedDate, HasLastModifiedAt, HasMongoId, HasSafeDelete} from "./bases";
import mongo from "mongodb";
import {UserPermissionKind} from "../enums/UserPermissionKind";

export interface User extends HasMongoId, HasIssuedDate, HasLastModifiedAt, HasSafeDelete
{
    name: UserName;
    email: Email;
    birthday: DayPrecDate;
    phoneNumber: PhoneNumber;
    gender: Gender;
    permission: UserPermissionKind,

    studentVerifications: StudentVerification[];
    mainStudentVerification?: mongo.ObjectId;
}
