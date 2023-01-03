import express, {Express} from 'express';
import dotenv from 'dotenv';
import {routes} from './routes';
import {RouteMethod} from "./types/RouteMethod";

dotenv.config();

const app: Express = express();
const port: number = Number.isInteger(process.env.PORT) ? Number(process.env.PORT) : 3000;


// This allows us to access the body of POST/PUT requests in our route handlers (as req.body)
app.use(express.json());

//  Allow access from elsewhere, avoiding COR errors
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

//  Allow serving static HTML files, such as the help file
app.use(express.static('public'));

// Add all the routes to our Express server exported from routes/index.ts
routes.forEach(route => {
    // @ts-ignore
    if (route.method === RouteMethod.getMethod) {
        app.get(route.path, route.handler);
    } else if (route.method === RouteMethod.postMethod) {
        app.post(route.path, route.handler);
    } else {
        console.error('Invalid route.method: ', route.method);
    }
});

app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
