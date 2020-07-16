export const typeDefs = `
scalar TimeStamp

enum None { NONE }

enum GroupMemberKind
{
    OWNER
    MANAGER
    NORMAL
    APPLICANT
}

enum Gender
{
    MALE, FEMALE, OTHERS
}

enum StudentVerificationState
{
    PENDED, CONFIRMED, REJECTED
}

enum GroupHistoryState
{
    PRIVATE, PENDING_PUBLIC_APPROVAL, PUBLIC
}

type TokenAndUserId
{
    token: String!
    userId: String!
}

input GroupApplicationStateInput
{
    from: TimeStamp
    to: TimeStamp
    requiredAssociation: ID
}

type GroupApplicationState
{
    from: TimeStamp
    to: TimeStamp
    requiredAssociation: ID
}

type Group
{
    id: ID!
    
    owner: User!
    issuedDate: TimeStamp!
    name: String!
    brief: String!
    introduction: String!
    isSchool: Boolean!
    association: Association!
    category: Category!
    poster: String
    background: String
    applicationState: GroupApplicationState
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

type Category
{
    id: ID!
}

type Query 
{
    user(id: ID!): User!
}

type Mutation
{
    createGroup(
        owner: ID!
        name: String!
        brief: String!
        introduction: String!
        isSchool: Boolean!
        association: ID!
        poster: Upload
        background: Upload
        category: ID!
        applicationState: GroupApplicationStateInput
    ): Group!
    updateGroup(
        groupId: ID!
        name: String
        brief: String
        introduction: String
        unsetPoster: Boolean
        unsetBackground: Boolean
        poster: Upload
        background: Upload
        category: ID
        unsetApplicationState: Boolean
        applicationState: GroupApplicationStateInput
    ): None
    destroyGroup(id: ID!): None
    applyGroup(
        groupId: ID!
        userId: ID!
    ): None
    leaveGroup(
        groupId: ID!
        userId: ID!
    ): None
    kickFromGroup(
        groupId: ID!
        userId: ID!
    ): None
    updateMember(
        groupId: ID!
        userId: ID!
        memberKind: GroupMemberKind! # Only Normal, Manager can be done.
    ): None
    succeedGroupOwner(
        groupId: ID!
        newOwnerId: ID!
    ): None
    
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
