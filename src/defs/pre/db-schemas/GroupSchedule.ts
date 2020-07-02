import {HasIssuedDate, HasLastModifiedAt, HasMongoId} from "./bases";
import {DayPrecDate} from "../simple-types";

export interface GroupSchedule extends HasMongoId, HasIssuedDate, HasLastModifiedAt
{
    title: string;
    date: DayPrecDate;
}
