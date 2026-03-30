export interface PostTagItem {
    id: number;
    name: string;
    slug: string;
}

export interface PostEngagementCounts {
    likes: number;
    dislikes: number;
    comments: number;
    views: number;
    bookmarks: number;
    subscribers: number;
    shares: number;
    reports: number;
}

export interface PostUserEngagementState {
    reactionType: "like" | "dislike" | null;
    isBookmarked: boolean;
    isSubscribed: boolean;
    notifyOnAuthorPost: boolean;
    isNotInterested: boolean;
}

export interface PostBase {
    id: number;
    title: string;
    description: string;
    category: string;
    content: string;
    coverImage: string | null;
    published: boolean;
    status?: string;
    scheduledAt?: Date | null;
    publishedAt?: Date | null;
    slug: string;
    authorId: string;
    author: {
        name: string;
    };
    createdAt: Date;
    updatedAt: Date;
    postTags?: Array<{
        tag: PostTagItem;
    }>;
}

export interface PostListProps {
    posts: PostBase[];
}

export interface PostCardProps {
    post: PostBase;
}

export interface PostContentProps {
    post: PostBase;
    isAuthor: boolean;
    engagement: PostEngagementCounts;
    userState: PostUserEngagementState;
    comments: Array<{
        id: number;
        postId: number;
        userId: string;
        parentId: number | null;
        content: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        user: {
            id: string;
            name: string;
            email: string;
            emailVerified: boolean | null;
            createdAt: Date;
            updatedAt: Date;
        } | null;
        replies: Array<{
            id: number;
            postId: number;
            userId: string;
            parentId: number | null;
            content: string;
            status: string;
            createdAt: Date;
            updatedAt: Date;
            user: {
                id: string;
                name: string;
                email: string;
                emailVerified: boolean | null;
                createdAt: Date;
                updatedAt: Date;
            } | null;
        }>;
    }>;
}

export interface DeletePostButtonProps {
    postId: number;
}
