

export interface PostListProps {
    posts: Array<{
        id: number,
        title: string,
        description: string,
        category: string,
        content: string,
        coverImage: string | null,
        published: boolean,
        slug: string,
        author: {
            name: string;
        },
        createdAt: Date,
        updatedAt: Date,
    }>
}

export interface PostCardProps {
    post:{
        id: number,
        title: string,
        description: string,
        category: string,
        content: string,
        coverImage: string | null,
        published: boolean,
        slug: string,
        author: {
            name: string;
        },
        createdAt: Date,
        updatedAt: Date,
    }
}

export interface PostContentProps{
 
     post:{
        id: number,
        title: string,
        description: string,
    category: string,
        content: string,
    coverImage: string | null,
    published: boolean,
        slug: string,
        author: {
            name: string;
        },
        createdAt: Date,
        updatedAt: Date,
    },
    isAuthor: boolean
}

export interface DeletePostButtonProps{
    postId: number,
    
}