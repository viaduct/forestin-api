import {GraphqlDef, mergeGraphqlDefs} from "../pre/new-graphql";
import {Context} from "../pre/Context";
import {dbObjProp} from "./graphqlSchema";
import {CollectionKind} from "../pre/defines";
import mongo from "mongodb";
import {AssociationId} from "../univ";
import {StudentVerificationState} from "../pre/StudentVerificationState";

const userDefs: GraphqlDef[] = [
    {
        typeDefs: `
            type User
            {
                id: ID!
                name: String! # 이름
                birthday: StaticDate! # 일 정확도의 ISO 표준 날짜
                phoneNumber: String! # 별도의 특수문자가 없는 전화번호. 국제전화의 경우에만 "+82 0112341234"의 형식으로 저장한다.
                email: String! # 이메일
                studentVerifications: [StudentVerification!]! # 학생 인증
                verifiedStudentVerifications: [StudentVerification!]! # 인증된 학생인증
                isVerified(universityId: ID!): Boolean! # 해당 유저가 해당 대학의 학생으로 인증되었는지 확인
            }
        `,
        resolvers: {
            User: {
                name: createDbObjPropForGraphql(CollectionKind.User, "name"),
                birthday: createDbObjPropForGraphql(CollectionKind.User, "birthday"),
                phoneNumber: createDbObjPropForGraphql(CollectionKind.User, "phoneNumber"),
                email: createDbObjPropForGraphql(CollectionKind.User, "email"),
                studentVerifications: createDbObjPropForGraphql(CollectionKind.User, "studentVerifications"),
                verifiedStudentVerifications: createDbObjPropForGraphql(
                    CollectionKind.User,
                    "studentVerifications",
                    (verifs: { state: StudentVerificationState }[]) => verifs.map(oneVerif => oneVerif.state == StudentVerificationState.Verified)
                ),
                isVerified: async (parent: { id: string }, args: { university: string }, context: Context) => {
                    const verifs = await dbObjProp(
                        context.db,
                        CollectionKind.User,
                        context.collectionNameMap,
                        new mongo.ObjectId(parent.id),
                        "studentVerifications",
                    );

                    async function parentAssociation(assocId: AssociationId): Promise<AssociationId> {
                        const {db, collectionNameMap: findName} = context;

                        const {parent: parentAssocId} = await db
                            .collection(findName(CollectionKind.Association))
                            .findOne({associationId: assocId}, {parent: 1});

                        return parentAssocId;
                    }

                    async function univFromMajor(majorId: AssociationId): Promise<AssociationId> {
                        return (
                            await parentAssociation(
                                await parentAssociation(
                                    await parentAssociation(
                                        majorId
                                    )
                                )
                            )
                        );
                    }

                    async function univsFromMajors(majorIds: AssociationId[]): Promise<AssociationId[]> {
                        return await Promise.all(majorIds.map(univFromMajor));
                    }

                    async function isVerifVerified(
                        verif: {
                            majors: AssociationId[],
                            state: StudentVerificationState,
                        },
                        univId: AssociationId,
                    ): Promise<boolean> {
                        if (verif.state == StudentVerificationState.Verified) {
                            const univIdsOfVerif = await univsFromMajors(verif.majors);
                            return univIdsOfVerif.includes(univId);
                        } else {
                            return false;
                        }
                    }

                    return verifs.filter((verif: any) => isVerifVerified(verif, args.university)).length != 0;
                }
            },
        },
    },
];

export const user: GraphqlDef = mergeGraphqlDefs(userDefs);

export function createDbObjPropForGraphql(
    collectionKind: CollectionKind,
    propName: string,
    caster: Function = (a: any)=>a,
): Function
{
    return async (parent: {id: string}, _: any, context: Context)=>{
        return caster(
            await dbObjProp(
                context.db,
                collectionKind,
                context.collectionNameMap,
                new mongo.ObjectId(parent.id),
                propName
            )
        );
    };
}

export function createStudentVerificationPropForGraphql(
    propName: string,
    caster: Function = (a: any)=>a,
): Function
{
    return async (parent: {id: string}, _: any, context: Context)=>{
        const uncastedResult = await context.db
            .collection(context.collectionNameMap(CollectionKind.User))
            .findOne(
                {"studentVerifications._id": new mongo.ObjectId(parent.id)},
                {_id: 0, [propName]: 1},
            );
        return caster(uncastedResult);
    };
}
