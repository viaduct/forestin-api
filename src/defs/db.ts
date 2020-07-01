import mongo from "mongodb";

// function createFromEmptyProject(givenProject: any): any
// {
//     return {
//         _id: 0, // By default, id is not included. If you want, specify it explicitly.
//         ...givenProject,
//     };
// }
//
// function throwForNotSingle(num: number)
// {
//     if ( num != 1 )
//     {
//         throw new Error("Length is not 1.");
//     }
// }
//
// async function absProps(collection: any, id: mongo.ObjectId, givenProject: any): Promise<any>
// {
//     return await absPropsByFilter(
//         collection,
//         {_id: id},
//         givenProject
//     );
// }
//
// async function absPropsByFilter(
//     collection: mongo.Collection,
//     filter: any,
//     givenProject: any
// ): Promise<any>
// {
//     const project = createFromEmptyProject(givenProject);
//
//     const queryResult = await collection
//         .find(filter)
//         .project(project)
//         .toArray();
//
//     throwForNotSingle(queryResult.length);
//
//     // Return it.
//     return queryResult[0];
// }

// export async function props(
//     db: mongo.Db,
//     collectionKind: CollectionKind,
//     id: mongo.ObjectId | null | undefined,
//     givenProject: any
// ): Promise<any | null>
// {
//     if ( id != null )
//     {
//         return await absProps(
//             db.collection(collectionName(collectionKind)),
//             id,
//             givenProject
//         );
//     }
//     else
//     {
//         return null;
//     }
// }
//
// export async function propsByFilter(
//     db: mongo.Db,
//     collectionKind: CollectionKind,
//     filter: any,
//     givenProject: any
// ): Promise<any>
// {
//     return await absPropsByFilter(
//         db.collection(collectionName(collectionKind)),
//         filter,
//         givenProject,
//     );
// }

// export async function prop(
//     db: mongo.Db,
//     collectionKind: CollectionKind,
//     id: mongo.ObjectId,
//     fieldName: string,
// ): Promise<any>
// {
//     const gotProps = await props(
//         db,
//         collectionKind,
//         id,
//         {[fieldName]: 1},
//     );
//     return gotProps[fieldName];
// }
//
// export async function isThereAnyCandidate(
//     db: mongo.Db,
//     collectionKind: CollectionKind,
//     filter: any,
// ): Promise<boolean>
// {
//     const collection = db.collection(collectionName(collectionKind));
//     const anyCandidate = await collection.findOne(filter, {_id: 1});
//     return anyCandidate != null;
// }
//
// class Test
// {
//     constructor(
//         public test: Function | null,
//         public subtests: Test[] = [],
//     ){}
// }
//
// export async function userProps(db: mongo.Db, findName: FindName, id: mongo.ObjectId, givenProject: any): Promise<any>
// {
//     return await absProps(
//         db.collection(findName(CollectionKind.User)),
//         id,
//         givenProject,
//     );
// }
//
// export async function studentVerificationProps(db: mongo.Db, findName: FindName, id: mongo.ObjectId, givenProject: any): Promise<any>
// {
//     return await absProps(
//         db.collection(findName(CollectionKind.StudentVerification)),
//         id,
//         givenProject,
//     );
// }


// async function studentVerificationAbsDate(
//     db: mongo.Db,
//     id: mongo.ObjectId,
//     matchingState: StudentVerificationState
// ): Promise<Date | null>
// {
//     const gotProps = await props(
//         db,
//         CollectionKind.StudentVerification,
//         id,
//         {state: 1, fixedDate: 1},
//     );
//
//     if ( gotProps.state == matchingState )
//     {
//         return gotProps.fixedDate;
//     }
//     else
//     {
//         return null;
//     }
// }
//
// export async function studentVerificationVerifiedDate(
//     db: mongo.Db,
//     id: mongo.ObjectId,
// ): Promise<Date | null>
// {
//     return await studentVerificationAbsDate(
//         db,
//         id,
//         StudentVerificationState.Verified
//     );
// }
//
// export async function studentVerificationRejectedDate(
//     db: mongo.Db,
//     id: mongo.ObjectId,
// ): Promise<Date | null>
// {
//     return await studentVerificationAbsDate(
//         db,
//         id,
//         StudentVerificationState.Rejected
//     );
// }
//
// export async function isUserVerifiedForUniversity(db: mongo.Db, userId: mongo.ObjectId, univId: AssociationId): Promise<boolean>
// {
//     // // Get collection.
//     // const colUser = db.collection(collectionName(CollectionKind.User));
//     // const colVerifs = db.collection(collectionName(CollectionKind.StudentVerification));
//     //
//     // // Get the user's verifications.
//     // const verificationIds = await prop(db, CollectionKind.User, userId, "studentVerifications");
//     //
//     // // Get actual verifications.
//     // const filter = {
//     //     _id: {$in: verificationIds},
//     //     majors:
//     // };
//     // const verifications: any[] = await colVerifs.find(filter).toArray();
//     //
//     // // Get majors of the verifications.
//     // async function getMajors(db: mongo.Db, ids: AssociationId[], result: any[] = []): Promise<any[]>
//     // {
//     //     if ( ids.length != 0 )
//     //     {
//     //         const [id, ...tailId] = ids;
//     //         const data = await association(db, id);
//     //         return getMajors(db, tailId, [...result, data]);
//     //     }
//     //     else
//     //     {
//     //         return result;
//     //     }
//     // }
//     //
//     // const majors = await Promise.all(verifications.map(async (oneVerif: any)=>{
//     //     return await getMajors(db, oneVerif.majors);
//     // }));
//     return false; // TODO
// }
//
// export async function verifiedStudentVerifications(db: mongo.Db, userId: mongo.ObjectId): Promise<any[]>
// {
//     return []; // TODO
// }
