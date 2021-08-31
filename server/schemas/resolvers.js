const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const {signToken} = require('../utils/auth');

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if(context.user) {
                return User.findOne({_id: context.user._id});
            }
            throw new AuthenticationError('You need to be logged in!');
        },
    },

    Mutation: {
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });
      
            if (!user) {
              throw new AuthenticationError('No profile with this email found!');
            }
      
            const correctPw = await user.isCorrectPassword(password);
      
            if (!correctPw) {
              throw new AuthenticationError('Incorrect password!');
            }
      
            const token = signToken(user);
            return { token, user };
        },

        addUser: async (parent, { username, email, password }) => {
            const user = await User.create({ username, email, password });
            const token = signToken(user);
      
            return { token, user };
        },
        
        saveBook: async (parent, args, context) => {
            if (context.user) {
                try {
                    const bookSave = await User.findOneAndUpdate(
                        {_id: context.user._id},
                        {$addToSet: {savedBooks: {...args}}},
                        {new: true, runValidators: true}
                    );
                    return bookSave;
                } catch (err) {
                    return err;
                }
            }
            throw new AuthenticationError('You need to be logged in!');
        },

        removeBook: async(parent, {bookId}, context) => {
            if (context.user) {
                try {
                const bookRemove = await User.findOneAndUpdate(
                    {_id: context.user._id},
                    {$pull: {savedBooks: {bookId}}},
                    {new: true}
                );
                return bookRemove; 
            } catch (err) {
                return err;
            }
        }
            throw new AuthenticationError('You need to be logged in!');
        }
    }
}

module.exports = resolvers;