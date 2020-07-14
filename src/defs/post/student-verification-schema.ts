import {GraphqlDef, mergeGraphqlDefs} from "../pre/actions/graphql-aggregate";
import {CollectionKind} from "../pre/enums/CollectionKind";
import {fromOldContext} from "../pre/context-2/Context2";
import {Context} from "../pre/Context";
import mongo from "mongodb";


const svDefs: GraphqlDef[] = [
    {
        typeDefs: `
            type StudentVerification
            {
                id: ID!
                issuedDate: TimeStamp! # 제출일자, 밀리초 정확도의 타임스탬프. 밀리초 정확도인 이유는 JS의 Date가 기본적으로 사용하는 정확도이기 때문.
                majors: [Major!]! # 선택한 전공, 같은 University에 있도록 constraint가 걸려있음.
                state: StudentVerificationState!
                
                evidences: [File!]!
                
                """
                evidences: [String!]! # image/jpeg, image/png 등의 증빙자료. 학생증 사진이 이 곳에 첨부. UI 상으로는 하나까지만 삽입될 수 있지만, API 상에서는 여러 장이 첨부될 수 있음.
                verifiedDate: TimeStamp! # 승인일자, state가 VERIFIED일 경우에만 유효한 값이 삽입되어있음.
                rejectedDate: TimeStamp! # 리젝일자, state가 REJECTED일 경우에만 유효한 값이 삽입되어 있음.
                """
                fixedDate: TimeStamp
            }
        `,
        resolvers: {
            StudentVerification: {
                issuedDate: async (parent: any, _: any, c1: Context)=>{
                    const c = await fromOldContext(c1);

                    // Get issued date.
                    const {issuedDate} = await c.mongo.collec(CollectionKind.StudentVerification).
                        findOne(
                        {_id: new mongo.ObjectId(parent.id)},
                        {_id: 0, issuedDate: 1}
                        );

                    // Return it.
                    return issuedDate;
                },
                majors: async (parent: any, _: any, c1: Context)=>{
                    const c = await fromOldContext(c1);

                    // Get majors.
                    const {majors} = await c.mongo.collec(CollectionKind.StudentVerification).
                    findOne(
                        {_id: new mongo.ObjectId(parent.id)},
                        {_id: 0, majors: 1}
                    );

                    return majors.map((major: any)=>({id: major}));
                },
                state: async (parent: any, _: any, c1: Context)=>{
                    const c = await fromOldContext(c1);

                    // Get issued date.
                    const {state} = await c.mongo.collec(CollectionKind.StudentVerification).
                    findOne(
                        {_id: new mongo.ObjectId(parent.id)},
                        {_id: 0, state: 1}
                    );

                    // Return it.
                    return state;
                },
                evidences: async (parent: any, _: any, c1: Context)=>{
                    const c = await fromOldContext(c1);

                    // Get issued date.
                    const {evidences} = await c.mongo.collec(CollectionKind.StudentVerification).
                    findOne(
                        {_id: new mongo.ObjectId(parent.id)},
                        {_id: 0, evidences: 1}
                    );

                    // Return it.
                    return evidences.map((evi: any)=>({id: evi}));
                },
                fixedDate: async (parent: any, _: any, c1: Context)=>{
                    const c = await fromOldContext(c1);

                    // Get issued date.
                    const {fixedDate} = await c.mongo.collec(CollectionKind.StudentVerification).
                    findOne(
                        {_id: new mongo.ObjectId(parent.id)},
                        {_id: 0, fixedDate: 1}
                    );

                    // Return it.
                    return fixedDate;
                },

                // issuedDate: createDbNestedObjpropForGraphql(CollectionKind.User, "studentVerifications", "issuedDate"),
                // majors: createDbNestedObjpropForGraphql(CollectionKind.User, "studentVerifications", "majors", (assocId: AssociationId)=>{return{id: assocId}}),
                // evidences: createDbNestedObjpropForGraphql(CollectionKind.User, "studentVerifications", "evidences"),
                // state: createDbNestedObjpropForGraphql(CollectionKind.User, "studentVerifications", "state"),
                // verifiedDate: createDbNestedObjpropForGraphql(CollectionKind.User, "studentVerifications", "verifiedDate"),
                // rejectedDate: createDbNestedObjpropForGraphql(CollectionKind.User, "studentVerifications", "rejectedDate"),
            },
        },
    },
];

export const studentVerification: GraphqlDef = mergeGraphqlDefs(svDefs);
