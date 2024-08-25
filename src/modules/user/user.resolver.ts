import { resolvers } from '../../graphql/resolvers';

export const userResolvers = {
    Query: {
        me: async (_: any, __: any, { req, User }: any) => {
            if (!req.userId) throw new Error('Not authenticated');
            return User.findById(req.userId);
        },
        users: async (_: any, __: any, { User }: any) => {
            return User.find();
        },
        user: async (_: any, { id }: any, { User }: any) => {
            return User.findById(id);
        },
    },
    Mutation: {
        signUp: async (_: any, { username, email, password }: any, { User, bcrypt, jwt, environment }: any) => {
            const hashedPassword = await bcrypt.hash(password, 10);
            const user = new User({ username, email, password: hashedPassword });
            await user.save();
            const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
            return { token, user };
        },
        login: async (_: any, { email, password }: any, { User, bcrypt, jwt, environment }: any) => {
            const user = await User.findOne({ email });
            if (!user) throw new Error('User not found');
            const valid = await bcrypt.compare(password, user.password);
            if (!valid) throw new Error('Incorrect password');
            const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
            return { token, user };
        },
        followUser: async (_: any, { userId }: any, { req, User }: any) => {
            if (!req.userId) throw new Error('Not authenticated');
            const user = await User.findById(req.userId);
            user.following.push(userId);
            await user.save();
            const followedUser = await User.findById(userId);
            followedUser.followers.push(req.userId);
            await followedUser.save();
            return followedUser;
        },
        unfollowUser: async (_: any, { userId }: any, { req, User }: any) => {
            if (!req.userId) throw new Error('Not authenticated');
            const user = await User.findById(req.userId);
            user.following.pull(userId);
            await user.save();
            const unfollowedUser = await User.findById(userId);
            unfollowedUser.followers.pull(req.userId);
            await unfollowedUser.save();
            return unfollowedUser;
        },
    },
};

