import {DayPrecDate, PhoneNumber} from "../simple-types";
import {StudentVerification} from "./StudentVerification";
import {Gender} from "../enums/Gender";
import {HasIssuedDate, HasLastModifiedAt, HasMongoId, HasSafeDelete} from "./bases";
import mongo from "mongodb";
import {UserPermissionKind} from "../enums/UserPermissionKind";

export interface User extends HasMongoId, HasIssuedDate, HasLastModifiedAt, HasSafeDelete
{
    name: string;
    email: string;
    birthday: DayPrecDate;
    phoneNumber: PhoneNumber;
    gender: Gender;
    permission: UserPermissionKind,

    studentVerifications: StudentVerification[];
    mainStudentVerification: mongo.ObjectId;
}
