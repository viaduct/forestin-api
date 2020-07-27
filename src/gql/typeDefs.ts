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

input BankAccountInput
{
    name: String!
    number: String!
}

type BankAccount
{
    name: String!
    number: String!
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

type GroupQna
{
    id: ID!
    issuedDate: TimeStamp!
    group: Group!
    author: User!
    body: String!
    answer: String
}

type GroupSchedule
{
    id: ID!
    group: Group!
    title: String!
    date: TimeStamp!
}

type GroupNotice
{
    id: ID!
    issuedDate: TimeStamp!
    lastModifiedAt: TimeStamp!
    group: Group!
    author: User!
    isUrgent: Boolean!
    title: String!
    body: String!
    files: [ID!]!
    images: [ID!]!
}

type GroupHistory
{
    id: ID!
    issuedDate: TimeStamp!
    lastModifiedAt: TimeStamp!
    group: Group!
    author: User!
    state: GroupHistoryState!
    title: String!
    body: String!
    images: String!
}

type GroupHistoryCmt
{
    id: ID!
    history: GroupHistory!
    issuedDate: TimeStamp!
    lastModifiedAt: TimeStamp!
    author: User!
    body: String!
}

type GroupBill
{
    id: ID!
    issuedDate: TimeStamp!
    lastModifiedAt: TimeStamp!
    group: Group!
    author: User!
    targets: [User!]!
    amount: Int!
    targetsPaid: [User!]!
    title: String!
    body: String!
    deadline: TimeStamp!
    receivingAccount: BankAccount
    kakaoUrl: String
    tossUrl: String
    isClosed: Boolean!
}

type VoteDecision
{
    voter: User!
    choices: [ID!]!
}

type VoteChoice
{
    id: ID!
    value: String!
}

type GroupVote
{
    id: ID!
    issuedDate: TimeStamp!
    lastModifiedAt: TimeStamp!
    group: User!
    author: User!
    choices: [VoteChoice!]!
    targets: [User!]!
    allowMultipleChoices: Boolean!
    isAnonymous: Boolean!
    decisions: [VoteDecision!]!
    title: String!
    body: String!
    deadline: TimeStamp!
}

enum ChatHostKind
{
    GROUP, GROUP_QNA
}

interface ChatHost
{
    kind: ChatHostKind
}

type ChatHostGroup implements ChatHost
{
    kind: ChatHostKind
    group: ID!
}

type ChatHostGroupQna implements ChatHost
{
    kind: ChatHostKind
    group: ID!
    user: ID!
}

type ChatRoom
{
    id: ID!
    issuedDate: TimeStamp!
    title: String!
    host: ChatHost!
}

type ChatMsg
{
    id: ID!
    issuedDate: TimeStamp!
    lastModifiedAt: TimeStamp!
    chatRoom: ChatRoom!
    author: User!
    body: ChatMsgBody!
}

enum ChatMsgBodyKind
{
    TEXT, FILE
}

interface ChatMsgBody
{
    kind: ChatMsgBodyKind!
}

type TextChatMsgBody implements ChatMsgBody
{
    kind: ChatMsgBodyKind!
    body: String!
}

type FileChatMsgBody implements ChatMsgBody
{
    kind: ChatMsgBodyKind!
    body: ID!
}

type Query 
{
    user(id: ID!): User
    groupBill(id: ID!): GroupBill
    group(id: ID!): Group
    groupVote(id: ID!): GroupVote
    chatRoom(id: ID!): ChatRoom
    chatMsg(id: ID!): ChatMsg
    groupSchedule(id: ID!): GroupSchedule
    groupNotice(id: ID!): GroupNotice
    groupHistory(id: ID!): GroupHistory
    groupQna(id: ID!): GroupQna
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
    
    createGroupQna(
        groupId: ID!
        authorId: ID!
        body: String!
    ): GroupQna!
    updateGroupQna(
        qnaId: ID!
        body: String
    ): None
    destroyGroupQna(id: ID!): None
    answerGroupQna(
        qnaId: ID!
        answer: String!
    ): None
    
    createGroupSchedule(
        groupId: ID!
        title: String!
        date: TimeStamp!
    ): GroupSchedule!
    updateGroupSchedule(
        scheduleId: ID!
        title: String
        date: TimeStamp
    ): None
    destroyGroupSchedule(id: ID!): None
    
    createGroupNotice(
        groupId: ID!
        authorId: ID!
        isUrgent: Boolean!
        title: String!
        body: String!
        files: [Upload!]!
        images: [Upload!]!
    ): GroupNotice!
    updateGroupNotice(
        noticeId: ID!
        isUrgent: Boolean
        title: String
        body: String
        filesAdded: [Upload!]
        filesRemoved: [ID!]
        imagesAdded: [Upload!]
        imagesRemoved: [ID!]
    ): None
    destroyGroupNotice(id: ID!): None

    createGroupVote(
        groupId: ID!
        author: ID!
        choices: [String!]!
        targets: [ID!]!
        allowMultipleChoices: Boolean!
        isAnonymous: Boolean!
        title: String!
        body: String!
        deadline: TimeStamp!
    ): GroupVote!
    updateGroupVote(
        voteId: ID!
        isAnonymous: Boolean
        title: String
        body: String
        deadline: TimeStamp
    ): None
    destroyGroupVote(id: ID!): None
    castGroupVote(
        voteId: ID!
        userId: ID!
        choices: [ID!]
    ): None
    
    createChatRoomOfGroup(
        groupId: ID!
        title: String!
        initialMembers: [ID!]!
    ): ChatRoom!
    createChatRoomOfGroupQna(
        groupId: ID!
        title: String!
        userId: ID!
    ): ChatRoom!
    updateChatRoom(
        chatRoomId: ID!
        title: String
        membersAdded: [ID!]
        membersRemoved: [ID!]
    ): None
    destroyChatRoom(id: ID!): None
    postChatMsg(
        chatRoomId: ID!
        authorId: ID!
        textBody: String!
    ): ChatMsg!
    postFileChatMsg(
        chatRoomId: ID!
        authorId: ID!
        file: Upload!
    ): ChatMsg!
}
`;
