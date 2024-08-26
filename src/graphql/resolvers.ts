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
            const user:any =  await User.findById(id);
            console.log(user)
            return user
        },
        searchUsers: async (_: any, { query }: any) => {
            return await User.find({ username: new RegExp(query, 'i') });
        },
        getCurrentUser: async (_: any, __: any, { req }: any) => {
            console.log('userid')
            if (!req?.userId) throw new Error('Not authenticated');
            console.log(req.userId,'userid')
            return await User.findById(req.userId);
        },
        getPost: async (_: any, { id }: any) => {
            return await Post.findById(id).populate('author');
        },
        getFeed: async (_: any, __: any, { req }: any) => {
            if (!req.userId) throw new Error('Not authenticated');
            const user = await User.findById(req.userId).populate('following');
            // return Post.find({ author: { $in: user.following } }).sort({ createdAt: -1 });
        },
        searchPosts: async (_: any, { query }: any) => {
            return await Post.find({ content: new RegExp(query, 'i') }).populate('author');
        },
        getNotifications: async (_: any, __: any, { req }: any) => {
            if (!req.userId) throw new Error('Not authenticated');
            return await Notification.find({ user: req.userId }).sort({ createdAt: -1 });
        },
        getMessages: async (_: any, { receiverId }: any, { req }: any) => {
            if (!req.userId) throw new Error('Not authenticated');
            return await Message.find({ sender: req.userId, receiver: receiverId }).sort({ createdAt: -1 });
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
            console.log('hello got it')
            const user = await User.findOne({ email });
            if (!user) throw new Error('User not found');
            const valid = await bcrypt.compare(password, user.password);
            if (!valid) throw new Error('Incorrect password');
            const token = await jwt.sign(
                { userId: user.id }, `${JWT_SECRET}`,{expiresIn: '2000m'});
                return { token, user };
        },
        followUser: async (_: any, { userId }: any, context: any) => {
            const {user} = context
            console.log(context,'reqqqqqqqqqqqqq')
            if (!user.userId) throw new Error('Not authenticated');
            const userDetails:any = await User.findById(user.userId);
            userDetails.following.push(userId);
            await userDetails.save();
            const followedUser:any = await User.findById(userId);
            followedUser.followers.push(user.userId);
            await followedUser.save();
            return followedUser;
        },
        unfollowUser: async (_: any, { userId }: any, context: any) => {
            const {user} = context
            if (!user.userId) throw new Error('Not authenticated');
            const userDetails:any = await User.findById(user.userId);
            userDetails.following.pull(userId);
            await userDetails.save();
            const unfollowedUser:any = await User.findById(userId);
            unfollowedUser.followers.pull(user.userId);
            await unfollowedUser.save();
            return unfollowedUser;
        },
        updateUserProfile: async (_: any, { bio, avatar }: any, context: any) => {
            if (!context.user.userId) throw new Error('Not authenticated');
            const user:any = await User.findById(context.user.userId);
            if (bio) user.bio = bio;
            if (avatar) {
                // Handle avatar upload
                user.avatar = avatar; // URL or file path after upload
            }
            await user.save();
            return user;
        },
        createPost: async (_: any, { content, media }: any, context: any) => {
            if (!context.user.userId) throw new Error('Not authenticated');
            const post = new Post({ content, media, author: context.user.userId });
            await post.save();
            return post.populate('author');
        },
        updatePost: async (_: any, { id, content, media }: any, context: any) => {
            if (!context.user.userId) throw new Error('Not authenticated');
            const post = await Post.findById(id);
            if (!post) throw new Error('Post not found');
            if (post.author.toString() !== context.user.userId) throw new Error('Not authorized');
            if (content) post.content = content;
            if (media) post.media = media;
            await post.save();
            return post.populate('author');
        },
        deletePost: async (_: any, { id }: any, context: any) => {
            if (!context.user.userId) throw new Error('Not authenticated');
            const post:any = await Post.findById(id);
            if (!post) throw new Error('Post not found');
            if (post.author.toString() !== context.user.userId) throw new Error('Not authorized');
            await post.remove();
            return true;
        },
        likePost: async (_: any, { id }: any, context: any) => {
            if (!context.user.userId) throw new Error('Not authenticated');
            const post = await Post.findById(id);
            if (!post) throw new Error('Post not found');
            post.likes.push(context.user.userId);
            await post.save();
            return post.populate('author');
        },
        unlikePost: async (_: any, { id }: any, context: any) => {
            if (!context.user.userId) throw new Error('Not authenticated');
            const post:any = await Post.findById(id);
            if (!post) throw new Error('Post not found');
            post.likes.pull(context.user.userId);
            await post.save();
            return post.populate('author');
        },
        addComment: async (_: any, { postId, content }: any, context: any) => {
            if (!context.user.userId) throw new Error('Not authenticated');
            const comment = new Comment({ post: postId, content, author: context.user.userId });
            await comment.save();
            return comment.populate('author');
        },
        editComment: async (_: any, { id, content }: any, context: any) => {
            if (!context.user.userId) throw new Error('Not authenticated');
            const comment = await Comment.findById(id);
            if (!comment) throw new Error('Comment not found');
            if (comment.author.toString() !== context.user.userId) throw new Error('Not authorized');
            comment.content = content;
            await comment.save();
            return comment.populate('author');
        },
        deleteComment: async (_: any, { id }: any, context: any) => {
            if (!context.user.userId) throw new Error('Not authenticated');
            const comment:any = await Comment.findById(id);
            if (!comment) throw new Error('Comment not found');
            if (comment.author.toString() !== context.user.userId) throw new Error('Not authorized');
            await comment.remove();
            return true;
        },
        likeComment: async (_: any, { id }: any, context: any) => {
            if (!context.user.userId) throw new Error('Not authenticated');
            const comment = await Comment.findById(id);
            if (!comment) throw new Error('Comment not found');
            comment.likes.push(context.user.userId);
            await comment.save();
            return comment.populate('author');
        },
        unlikeComment: async (_: any, { id }: any, context: any) => {
            if (!context.user.userId) throw new Error('Not authenticated');
            const comment:any = await Comment.findById(id);
            if (!comment) throw new Error('Comment not found');
            comment.likes.pull(context.user.userId);
            await comment.save();
            return comment.populate('author');
        },
        sendMessage: async (_: any, { receiverId, content }: any, context: any) => {
            if (!context.user.userId) throw new Error('Not authenticated');
            const message = new Message({ sender: context.user.userId, receiver: receiverId, content });
            await message.save();
            return message.populate('sender receiver');
        },
        markNotificationAsRead: async (_: any, { id }: any, context: any) => {
            if (!context.user.userId) throw new Error('Not authenticated');
            const notification = await Notification.findById(id);
            if (!notification) throw new Error('Notification not found');
            notification.isRead = true;
            await notification.save();
            return notification;
        },
        markAllNotificationsAsRead: async (_: any, __: any, context: any) => {
            if (!context.user.userId) throw new Error('Not authenticated');
            await Notification.updateMany({ user: context.user.userId, isRead: false }, { isRead: true });
            return Notification.find({ user: context.user.userId }).sort({ createdAt: -1 });
        },
    },
};
