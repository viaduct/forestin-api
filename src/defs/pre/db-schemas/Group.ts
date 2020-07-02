import {HasIssuedDate, HasLastModifiedAt, HasMongoId} from "./bases";
import {GroupName, S3Key} from "../simple-types";
import {AssociationId} from "../simple-types";

export interface Group extends HasMongoId, HasIssuedDate, HasLastModifiedAt
{
    name: GroupName;
    description: string;
    isSchool: boolean;
    association: AssociationId;

    poster: S3Key;
    background: S3Key;

    applicationState: GroupApplicationState | null;
}

export interface GroupApplicationState
{
    applicableFrom?: Date;
    applicableTo?: Date;
    requiredAssociation: AssociationId;
}
