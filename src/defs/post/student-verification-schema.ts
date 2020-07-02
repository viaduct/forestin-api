import {GraphqlDef, mergeGraphqlDefs} from "../pre/actions/graphql-aggregate";
import {createDbNestedObjpropForGraphql} from "../pre/actions/db";
import {CollectionKind} from "../pre/enums/CollectionKind";
import {AssociationId} from "../pre/simple-types";

const svDefs: GraphqlDef[] = [
    {
        typeDefs: `
            type StudentVerification
            {
                id: ID!
                issuedDate: TimeStamp! # 제출일자, 밀리초 정확도의 타임스탬프. 밀리초 정확도인 이유는 JS의 Date가 기본적으로 사용하는 정확도이기 때문.
                majors: [Major!]! # 선택한 전공, 같은 University에 있도록 constraint가 걸려있음.
                evidences: [String!]! # image/jpeg, image/png 등의 증빙자료. 학생증 사진이 이 곳에 첨부. UI 상으로는 하나까지만 삽입될 수 있지만, API 상에서는 여러 장이 첨부될 수 있음.
                state: StudentVerificationState!
                verifiedDate: TimeStamp! # 승인일자, state가 VERIFIED일 경우에만 유효한 값이 삽입되어있음.
                rejectedDate: TimeStamp! # 리젝일자, state가 REJECTED일 경우에만 유효한 값이 삽입되어 있음.
            }
        `,
        resolvers: {
            StudentVerification: {
                issuedDate: createDbNestedObjpropForGraphql(CollectionKind.User, "studentVerifications", "issuedDate"),
                majors: createDbNestedObjpropForGraphql(CollectionKind.User, "studentVerifications", "majors", (assocId: AssociationId)=>{return{id: assocId}}),
                evidences: createDbNestedObjpropForGraphql(CollectionKind.User, "studentVerifications", "evidences"),
                state: createDbNestedObjpropForGraphql(CollectionKind.User, "studentVerifications", "state"),
                verifiedDate: createDbNestedObjpropForGraphql(CollectionKind.User, "studentVerifications", "verifiedDate"),
                rejectedDate: createDbNestedObjpropForGraphql(CollectionKind.User, "studentVerifications", "rejectedDate"),
            },
        },
    },
];

export const studentVerification: GraphqlDef = mergeGraphqlDefs(svDefs);
