import express from "express";
import subjectRouter from "./routes/subject";
import cors from 'cors';

const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: ['GET','POST','PUT','DELET'],
    credentials:true
}))

app.use(express.json());
app.use('/api/subjects', subjectRouter);

app.get("/", (req, res) => {    
    res.send("Hello World!");
});

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});