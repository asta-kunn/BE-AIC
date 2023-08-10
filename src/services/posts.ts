import Post from "../models/posts";
import User from "../models/users";
import Comment from "../models/comments";
import { Schema } from "mongoose";

interface CommentUser {
  _id: string;
  content: string;
  author: User;
  parentId: Schema.Types.ObjectId;
  parentType: number;
  createdAt: Date;
}

interface CommentResponse {
  _id: string;
  content: string;
  author: Schema.Types.ObjectId;
  parentId: Schema.Types.ObjectId;
  parentType: number;
  createdAt: Date;
  replies: CommentResponse[];
}

interface PostDetailsResponse {
  _id: string;
  title: string;
  content: string;
  author: Schema.Types.ObjectId;
  createdAt: Date;
  comments: CommentResponse[];
}

export interface PostWithUserCommunity {
  _id: any;
  __v: any;
  title: string;
  content: string;
  author: User;
  createdAt: Date;
}

export interface PostWithAuthorCommunityResponse {
  _id: string;
  title: string;
  content: string;
  author: string;
  createdAt: Date;
  __v: number;
}

class PostService {
  async create(
    title: string,
    content: string,
    username: string,
  ): Promise<Post> {
    const userDoc = await User.findOne({ username: username });
    if (!userDoc) {
      throw new Error("User does not exist");
    }

    const post = Post.create({
      title: title,
      content: content,
      author: userDoc._id,
    }).catch((error) => {
      throw new Error(error.message);
    });

    return post;
  }

  async getJoinedPosts(
    email: string
  ): Promise<PostWithAuthorCommunityResponse[]> {
    const user = await User.findOne({ email: email });
    if (!user) {
      throw new Error("User does not exist");
    }

    const posts: PostWithUserCommunity[] = await Post.find({
    })
      .sort({ createdAt: -1 })
      .populate("author", "username") 

    const res = await Promise.all(
      posts.map(async (post) => {
        const comments = await this.getCommentsRecursive(post._id);
        return {
          _id: post._id,
          title: post.title,
          content: post.content,
          author: post.author.username,
          createdAt: post.createdAt,
          totalComments: comments.totalComments,
          __v: post.__v,
        };
      })
    );

    return res;
  }

  async deletePost(email: string, postId: string): Promise<boolean> {
    const post = await Post.findById(postId);
    if (!post) {
      throw new Error("Post does not exist");
    }
    const user = await User.findOne({ email: email });
    if (!user) {
      throw new Error("User does not exist");
    }
    if (post.author.toString() !== user._id.toString()) {
      throw new Error("User is not the author of this post");
    }

    await Post.findByIdAndDelete(post._id)
      .then(() => {
        return true;
      })
      .catch((error) => {
        throw new Error(error.message);
      });
    return true;
  }

  async getPostDetails(postId: string): Promise<PostDetailsResponse> {
    const post: any = await Post.findById(postId)
      .populate("author", "username")
    if (!post) {
      throw new Error("Post does not exist");
    }
    const comments = await this.getCommentsRecursive(postId);
    const postResponse: PostDetailsResponse = {
      _id: post._id,
      title: post.title,
      content: post.content,
      author: post.author.username,
      createdAt: post.createdAt,
      comments: comments.comments,
    };
    return postResponse;
  }

  async getCommentsRecursive(
    parentId: string
  ): Promise<{ comments: CommentResponse[]; totalComments: number }> {
    const comments: any[] = await Comment.find({ parentId: parentId })
      .populate("author", "username")
      .sort({
        createdAt: -1,
      });
    const nestedComments: CommentResponse[] = [];
    let totalComments = comments.length;

    for (const comment of comments) {
      const nestedComment: CommentResponse = {
        _id: comment._id,
        content: comment.content,
        author: comment.author,
        parentId: comment.parentId,
        parentType: comment.parentType,
        createdAt: comment.createdAt,
        replies: [],
      };
      const subCommentsResult = await this.getCommentsRecursive(comment._id);
      if (subCommentsResult.totalComments > 0) {
        totalComments += subCommentsResult.totalComments;
        nestedComment.replies = subCommentsResult.comments;
      }
      nestedComments.push(nestedComment);
    }

    return { comments: nestedComments, totalComments };
  }
}

export default new PostService();