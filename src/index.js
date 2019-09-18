import 'dotenv/config';
import express from 'express';
import { ApolloServer, gql } from 'apollo-server-express';
import uuidv4 from 'uuid/v4';
import cors from 'cors';
const app = express();
const schema = gql`
	type Query {
		me: User
		user(id: ID): User
		users: [User!]
		messages: [Message!]!
		message(id: ID!): Message!
	}

	type Mutation {
		createMessage(text: String!): Message!
		deleteMessage(id: ID!): Boolean!
		updateMessage(id: ID!, text: String!): Message!
	}

	type User {
		id: ID!
		username: String!
		messages: [Message!]
	}

	type Message {
		id: ID!
		text: String!
		user: User!
	}
`;

let users = {
	1: {
		id: '1',
		username: 'Robin Wieruch',
		messageIds: [ 1 ]
	},
	2: {
		id: '2',
		username: 'Dave Davids',
		messageIds: [ 2 ]
	}
};

let messages = {
	1: {
		id: '1',
		text: 'Hello World',
		userId: '1'
	},
	2: {
		id: '2',
		text: 'By World',
		userId: '2'
	}
};

const resolvers = {
	Query: {
		me: (parent, args, { me }) => {
			return me;
		},
		user: (parent, { id }) => {
			return users[id];
		},
		users: () => {
			return Object.values(users);
		},
		messages: () => {
			return Object.values(messages);
		},
		message: (parent, { id }) => {
			return messages[id];
		}
	},
	Mutation: {
		createMessage: (parent, { text }, { me }) => {
			const id = uuidv4();
			const message = {
				id,
				text,
				userId: me.id
			};
			messages[id] = message;
			users[me.id].messageIds.push(id);
			return message;
		},
		deleteMessage: (parent, { id }) => {
			const { [id]: message, ...otherMessages } = messages;
			if (!message) {
				return false;
			}
			messages = otherMessages;
			return true;
		},
		updateMessage: (parent, { text, id }) => {
			messages[id].text = text;
			return messages[id];
		}
	},
	User: {
		messages: (user) => {
			return Object.values(messages).filter((message) => message.userId === user.id);
		}
	},
	Message: {
		// user:(parent, args, {me})
		user: (message) => {
			return users[message.userId];
		}
	}
};

const server = new ApolloServer({
	typeDefs: schema,
	resolvers,
	context: {
		me: users[1]
	}
});

server.applyMiddleware({ app, path: '/graphql' });
app.listen({ port: 8000 }, () => {
	console.log('Apollo Server on http://localhost:8000/graphql');
});
// const userCredentials = { firstname: 'Robin' };
// const userDetails = { nationality: 'German' };

// const user = {
// 	...userCredentials,
// 	...userDetails
// };

// console.log(user);
// console.log(process.env.SOME_ENV_VARIBLE);
