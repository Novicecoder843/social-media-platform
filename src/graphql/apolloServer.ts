import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from "@apollo/server/standalone";
import  {typeDefs} from './typeDefs';
import { resolvers } from './resolvers';
import { error } from 'console';
import verifyToken from '../utills/verifyToken'
// import auth_middleware from './middelware/auth';
interface MyContext {
    user?: {
        id: string;
        email: string;
    };
    // Add other context properties if needed
}

const gqlServer = new ApolloServer({
    typeDefs,
    resolvers
})

const startApolloServer = async () => {
    const { url } = await startStandaloneServer(gqlServer, {
        listen: { port: 4000},
        context: async ({ req }: any) => {
            const token = req.headers.authorization;

            if(token){
                const user = await verifyToken(token);
                console.log(user)
                return { user }
            }

            return;
        }
    })
    // console.log(`Server ready at ${url}`);
}   

export { startApolloServer, gqlServer };
