import {Context} from "../Context";
import mongo from "mongodb";
import {AssociationId} from "../simple-types";
import {dbObjProp} from "./db";
import {CollectionKind} from "../enums/CollectionKind";
import {associationKindToLevel, associationParentAtLevel} from "./association";
import {AssociationLevelKind} from "../enums/AssociationEnumKind";
import {StudentVerificationState} from "../enums/StudentVerificationState";

export async function isUserVerifiedForUniv(
    context: Context,
    userId: mongo.ObjectId,
    univId: AssociationId,
): Promise<boolean>
{
    const verifs = await dbObjProp(
        context,
        CollectionKind.User,
        new mongo.ObjectId(userId),
        "studentVerifications",
    );

    async function univsFromMajors(majorIds: AssociationId[]): Promise<AssociationId[]> {
        return await Promise.all(majorIds.map(majorId=>associationParentAtLevel(
            context,
            majorId,
            associationKindToLevel(AssociationLevelKind.University)
        )));
    }

    async function isVerifVerified(
        verif: {
            majors: AssociationId[],
            state: StudentVerificationState,
        },
        univId: AssociationId,
    ): Promise<boolean> {
        if (verif.state == StudentVerificationState.Verified) { // ... is verified, and
            const univIdsOfVerif = await univsFromMajors(verif.majors);
            return univIdsOfVerif.includes(univId); // ... has the same univ. So verified.
        } else {
            return false; // ... otherwise false.
        }
    }

    return verifs.filter((verif: any) => isVerifVerified(verif, univId)).length != 0; // Anything verified? If yes, verified.
}
