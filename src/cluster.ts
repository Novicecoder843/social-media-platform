// cluster.ts
import cluster from 'cluster';
import os from 'os';
import { startServer } from './server';

if (cluster.isMaster) {
    console.log('Master process is running');
    const numCPUs = os.cpus().length;
    console.log(`Master ${process.pid} is running`);

    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker) => {
        console.log(`Worker ${worker.process.pid} died`);
        cluster.fork();  // Fork a new worker when one dies
    });

    process.on('SIGTERM', () => {
        console.log('Master shutting down gracefully');
        cluster.disconnect(() => {
            console.log('All workers have been shut down');
            process.exit(0);
        });
    });

    process.on('SIGINT', () => {
        console.log('Master shutting down gracefully');
        cluster.disconnect(() => {
            console.log('All workers have been shut down');
            process.exit(0);
        });
    });
} else {
    console.log('Worker process is running');
    startServer();
    console.log(`Worker ${process.pid} started`);

    process.on('SIGTERM', () => {
        console.log(`Worker ${process.pid} shutting down gracefully`);
        process.exit(0);
    });

    process.on('SIGINT', () => {
        console.log(`Worker ${process.pid} shutting down gracefully`);
        process.exit(0);
    });
}
