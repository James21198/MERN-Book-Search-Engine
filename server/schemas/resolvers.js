const { User } = require('../models');
const { signToken, AuthenticationError } = require('../utils/auth');

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
                const userData = await User.findOne({ _id: context.user._id }).select('-__v -password');
                return userData;
            }
            throw AuthenticationError;
        },
    },

    Mutation: {
        addUser: async (parent, args) => {
            const user = await User.create(args);
            const token = signToken(user);
            return { token, user }
        },
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });

            if (!user) {
                throw AuthenticationError;
            }

            const correctPw = await user.isCorrectPassword(password);

            if (!correctPw) {
                throw AuthenticationError;
            }

            const token = signToken(user);
            return { token, user };
        },
        saveBook: async (parent, args, context) => {
            const { input } = args;
            if(!context.user) throw AuthenticationError;
            const user = await User.findByIdAndUpdate(
                { $addToSet: { savedBooks: input } },
                { new: true }
            );
            return user;
        },
        removeBook: async (parent, args, context) => {
            const { bookId } = args;
            if(!context.user) throw AuthenticationError;
            const user = await User.findByIdAndUpdate(
                context.user._id,
                { $pull: { savedBooks: { bookId } } },
                { new: true }
            );
            return user;
        }
    },
};

module.exports = resolvers;