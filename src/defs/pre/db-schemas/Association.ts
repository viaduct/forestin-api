import {HasMongoId} from "./bases";
import {AssociationId, AssociationName, AssociationLevel} from "../simple-types";

export interface Association extends HasMongoId
{
    associationId: AssociationId;
    name: AssociationName;
    parent: AssociationId;
    level: AssociationLevel;
}
