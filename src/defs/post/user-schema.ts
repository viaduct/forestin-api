import {GraphqlDef, mergeGraphqlDefs} from "../pre/actions/graphql-aggregate";
import {Context} from "../pre/Context";
import mongo from "mongodb";
import {StudentVerificationState} from "../pre/enums/StudentVerificationState";
import {CollectionKind} from "../pre/enums/CollectionKind";
import {AssociationId} from "../pre/simple-types";
import {createDbObjPropForGraphql, dbObjProp} from "../pre/actions/db";
import {associationKindToLevel, associationParentAtLevel} from "../pre/actions/association";
import {AssociationLevelKind} from "../pre/enums/AssociationEnumKind";
import {isUserVerifiedForUniv} from "../pre/actions/user";

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
                    (verifs: { state: StudentVerificationState }[]) => verifs.filter(oneVerif => oneVerif.state == StudentVerificationState.Verified)
                ),
                isVerified: async (parent: { id: string }, args: { university: string }, context: Context) => {
                    return await isUserVerifiedForUniv(context, new mongo.ObjectId(parent.id), args.university);
                }
            },
        },
    },
];

export const user: GraphqlDef = mergeGraphqlDefs(userDefs);

