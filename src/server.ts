import express, { Application } from "express";
import { expressMiddleware as expressMiddleware} from '@apollo/server/express4';
import { graphqlHTTP } from "express-graphql";
import { makeExecutableSchema } from '@graphql-tools/schema';
import {typeDefs} from './graphql/typeDefs';
import cors from 'cors'
import { resolvers } from "./graphql/resolvers";
import dotenv from 'dotenv'
import { connectDB } from './config/db';
import {startApolloServer, gqlServer} from "./graphql/apolloServer";
import auth_middleware from './middelware/auth';
dotenv.config();

const schema = makeExecutableSchema({
    typeDefs,
    resolvers
})

export const startServer = async () => {
    const app: Application = express();

    await startApolloServer()

    app.use(express.json());
    await connectDB();
    app.use(express.urlencoded({ extended: true }));
    app.use(cors())

    // await gqlServer.start()
    app.use('/graphql', cors(), express.json(), expressMiddleware(gqlServer));

    app.use('/graphiql', graphqlHTTP({
        schema,
        graphiql: true
    }))
    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`GraphQL available at http://localhost:${PORT}/graphql`);
    
    })
}

startServer();