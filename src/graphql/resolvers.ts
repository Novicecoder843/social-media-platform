import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../modules/user/user.model';
import { Post } from '../modules/post/post.model';
import { Comment } from '../modules/comment/comment.model';
import { Notification } from '../modules/notification/notification.model';
import { Message } from '../modules/message/message.model';
import dotenv from 'dotenv';
dotenv.config();
const {JWT_SECRET} = process.env;
console.log(JWT_SECRET,'JWT_SECRET')

export const resolvers = {
    Query: {
        getUser: async (_: any, { id }: any) => {
            return User.findById(id);
        },
        searchUsers: async (_: any, { query }: any) => {
            return User.find({ username: new RegExp(query, 'i') });
        },
        getCurrentUser: async (_: any, __: any, { req }: any) => {
            if (!req.userId) throw new Error('Not authenticated');
            return User.findById(req.userId);
        },
        getPost: async (_: any, { id }: any) => {
            return Post.findById(id).populate('author');
        },
        getFeed: async (_: any, __: any, { req }: any) => {
            if (!req.userId) throw new Error('Not authenticated');
            const user = await User.findById(req.userId).populate('following');
            // return Post.find({ author: { $in: user.following } }).sort({ createdAt: -1 });
        },
        searchPosts: async (_: any, { query }: any) => {
            return Post.find({ content: new RegExp(query, 'i') }).populate('author');
        },
        getNotifications: async (_: any, __: any, { req }: any) => {
            if (!req.userId) throw new Error('Not authenticated');
            return Notification.find({ user: req.userId }).sort({ createdAt: -1 });
        },
        getMessages: async (_: any, { receiverId }: any, { req }: any) => {
            if (!req.userId) throw new Error('Not authenticated');
            return Message.find({ sender: req.userId, receiver: receiverId }).sort({ createdAt: -1 });
        },
    },
    Mutation: {
        signUp: async (_: any, { username, email, password }: any) => {
            const hashedPassword = await bcrypt.hash(password, 10);
            const user = new User({ username, email, password: hashedPassword });
            await user.save();
            const token = await jwt.sign({ userId: user.id }, "dddddddd",
                {
                  expiresIn: '1hr'
                });
                return { token, user };

        },
        login: async (_: any, { email, password }: any) => {
            const user = await User.findOne({ email });
            if (!user) throw new Error('User not found');
            const valid = await bcrypt.compare(password, user.password);
            if (!valid) throw new Error('Incorrect password');
            const token = await jwt.sign(
                { userId: user.id }, "dddddddd",{expiresIn: '2000m'});
                return { token, user };
        },
        followUser: async (_: any, { userId }: any, { req }: any) => {
            if (!req.userId) throw new Error('Not authenticated');
            const user:any = await User.findById(req.userId);
            user.following.push(userId);
            await user.save();
            const followedUser:any = await User.findById(userId);
            followedUser.followers.push(req.userId);
            await followedUser.save();
            return followedUser;
        },
        unfollowUser: async (_: any, { userId }: any, { req }: any) => {
            if (!req.userId) throw new Error('Not authenticated');
            const user:any = await User.findById(req.userId);
            user.following.pull(userId);
            await user.save();
            const unfollowedUser:any = await User.findById(userId);
            unfollowedUser.followers.pull(req.userId);
            await unfollowedUser.save();
            return unfollowedUser;
        },
        updateUserProfile: async (_: any, { bio, avatar }: any, { req }: any) => {
            if (!req.userId) throw new Error('Not authenticated');
            const user:any = await User.findById(req.userId);
            if (bio) user.bio = bio;
            if (avatar) {
                // Handle avatar upload
                user.avatar = avatar; // URL or file path after upload
            }
            await user.save();
            return user;
        },
        createPost: async (_: any, { content, media }: any, { req }: any) => {
            if (!req.userId) throw new Error('Not authenticated');
            const post = new Post({ content, media, author: req.userId });
            await post.save();
            return post.populate('author');
        },
        updatePost: async (_: any, { id, content, media }: any, { req }: any) => {
            if (!req.userId) throw new Error('Not authenticated');
            const post = await Post.findById(id);
            if (!post) throw new Error('Post not found');
            if (post.author.toString() !== req.userId) throw new Error('Not authorized');
            if (content) post.content = content;
            if (media) post.media = media;
            await post.save();
            return post.populate('author');
        },
        deletePost: async (_: any, { id }: any, { req }: any) => {
            if (!req.userId) throw new Error('Not authenticated');
            const post:any = await Post.findById(id);
            if (!post) throw new Error('Post not found');
            if (post.author.toString() !== req.userId) throw new Error('Not authorized');
            await post.remove();
            return true;
        },
        likePost: async (_: any, { id }: any, { req }: any) => {
            if (!req.userId) throw new Error('Not authenticated');
            const post = await Post.findById(id);
            if (!post) throw new Error('Post not found');
            post.likes.push(req.userId);
            await post.save();
            return post.populate('author');
        },
        unlikePost: async (_: any, { id }: any, { req }: any) => {
            if (!req.userId) throw new Error('Not authenticated');
            const post:any = await Post.findById(id);
            if (!post) throw new Error('Post not found');
            post.likes.pull(req.userId);
            await post.save();
            return post.populate('author');
        },
        addComment: async (_: any, { postId, content }: any, { req }: any) => {
            if (!req.userId) throw new Error('Not authenticated');
            const comment = new Comment({ post: postId, content, author: req.userId });
            await comment.save();
            return comment.populate('author');
        },
        editComment: async (_: any, { id, content }: any, { req }: any) => {
            if (!req.userId) throw new Error('Not authenticated');
            const comment = await Comment.findById(id);
            if (!comment) throw new Error('Comment not found');
            if (comment.author.toString() !== req.userId) throw new Error('Not authorized');
            comment.content = content;
            await comment.save();
            return comment.populate('author');
        },
        deleteComment: async (_: any, { id }: any, { req }: any) => {
            if (!req.userId) throw new Error('Not authenticated');
            const comment:any = await Comment.findById(id);
            if (!comment) throw new Error('Comment not found');
            if (comment.author.toString() !== req.userId) throw new Error('Not authorized');
            await comment.remove();
            return true;
        },
        likeComment: async (_: any, { id }: any, { req }: any) => {
            if (!req.userId) throw new Error('Not authenticated');
            const comment = await Comment.findById(id);
            if (!comment) throw new Error('Comment not found');
            comment.likes.push(req.userId);
            await comment.save();
            return comment.populate('author');
        },
        unlikeComment: async (_: any, { id }: any, { req }: any) => {
            if (!req.userId) throw new Error('Not authenticated');
            const comment:any = await Comment.findById(id);
            if (!comment) throw new Error('Comment not found');
            comment.likes.pull(req.userId);
            await comment.save();
            return comment.populate('author');
        },
        sendMessage: async (_: any, { receiverId, content }: any, { req }: any) => {
            if (!req.userId) throw new Error('Not authenticated');
            const message = new Message({ sender: req.userId, receiver: receiverId, content });
            await message.save();
            return message.populate('sender receiver');
        },
        markNotificationAsRead: async (_: any, { id }: any, { req }: any) => {
            if (!req.userId) throw new Error('Not authenticated');
            const notification = await Notification.findById(id);
            if (!notification) throw new Error('Notification not found');
            notification.isRead = true;
            await notification.save();
            return notification;
        },
        markAllNotificationsAsRead: async (_: any, __: any, { req }: any) => {
            if (!req.userId) throw new Error('Not authenticated');
            await Notification.updateMany({ user: req.userId, isRead: false }, { isRead: true });
            return Notification.find({ user: req.userId }).sort({ createdAt: -1 });
        },
    },
};
