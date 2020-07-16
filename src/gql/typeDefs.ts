export const typeDefs = `
scalar TimeStamp

enum None { NONE }

enum Gender
{
    MALE, FEMALE, OTHERS
}

enum StudentVerificationState
{
    PENDED, CONFIRMED, REJECTED
}

type TokenAndUserId
{
    token: String!
    userId: String!
}

type User
{
    id: ID!
    issuedDate: TimeStamp!
    name: String!
    email: String!
    birthday: String!
    phoneNumber: String!
    gender: Gender!
    primaryStudentVerification: StudentVerification
}

type StudentVerification
{
    id: ID!
    issuedDate: TimeStamp!
    user: User!
    evidences: [ID!]!
    majors: [Association!]
    admissionYear: String!
    state: StudentVerificationState!
    confirmedDate: TimeStamp
    rejectedDate: TimeStamp
}

type Association
{
    id: ID!
}

type Query 
{
    user(id: ID!): User!
}

type Mutation
{
    signIn(
        email: String!
        password: String!
    ): TokenAndUserId!
    refreshToken(
        oldToken: String!
    ): String!
    signUp(
        email: String!
        password: String!
        name: String!
        birthday: String!
        gender: Gender!
        phoneNumber: String!
    ): User!
    updateUser(
        userId: ID!
        password: String!
    ): None
    destroyUser(id: ID!): None
    requestStudentVerification(
        userId: ID!
        evidences: [Upload!]!
        majors: [ID!]!
        admissionYear: String!
    ): StudentVerification!
    confirmStudentVerification(
        studentVerificationId: ID!
    ): None
    rejectStudentVerification(
        studentVerificationId: ID!
    ): None
    findPassword(
        userId: ID!
    ): None
}
`;
