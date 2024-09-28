import express, { Express } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import multer from 'multer';
import routes from './routes';
import * as mongo from './services/mongo.service';

dotenv.config();

const app: Express = express();
const port = process.env.PORT;
const allowedOrigins = process.env.CORS_ORIGIN;
const upload = multer({ dest: 'uploads/' });

app.use(express.json());

const options: cors.CorsOptions = {
  origin: allowedOrigins || 'http://localhost:4200',
  credentials: true,
};

app.use(cors(options));

// Use the router
app.use(routes);

(async () => {
    try {
        await mongo.connectToDatabase();
        
        app.listen(port, () => {
            console.log(`⚡️[server]: Server is running on port ${port} ⚡️⚡️⚡️⚡️⚡️`);
        });
    } catch (err) {
        console.error("Failed to connect to the database or start the server:", err);
    }
})();