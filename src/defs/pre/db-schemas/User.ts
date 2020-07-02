import {DayPrecDate, PhoneNumber} from "../simple-types";
import {StudentVerification} from "./StudentVerification";
import {Gender} from "../enums/Gender";
import {HasIssuedDate, HasLastModifiedAt, HasMongoId} from "./bases";

export interface User extends HasMongoId, HasIssuedDate, HasLastModifiedAt
{
    name: string;
    email: string;
    birthday: DayPrecDate;
    studentVerifications: StudentVerification[];
    phoneNumber: PhoneNumber;
    gender: Gender;
}
