import {GraphqlKind} from "../../lib/Graphql";

export const kind = GraphqlKind.Type;
export const name = "User";
export const schema = `
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
`;

import * as birthday from "./birthday";
import * as email from "./email";
import * as isVerified from "./isVerified";
import * as nameModule from "./name";
import * as phoneNumber from "./phoneNumber";
import * as studentVerifications from "./studentVerifications";
import * as verifiedStudentVerifications from "./verifiedStudentVerifications";

export const handlers = [
    birthday,
    email,
    isVerified,
    nameModule,
    phoneNumber,
    studentVerifications,
    verifiedStudentVerifications,
];
