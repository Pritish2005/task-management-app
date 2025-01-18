const express = require('express');
const mongoose=require('mongoose');
const app = express();
const dotenv = require('dotenv');
const cors = require('cors');
const auth=require('./routes/auth.js')
const task=require('./routes/task.js')


app.use(express.json());
dotenv.config();
app.use(cors());
const port = process.env.PORT||5000;

app.use('/api/auth',auth);
app.use('/api/task',task);


const connectToDb=async()=>{
  const db=await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');
  app.listen(port,()=>{
      console.log(`Server is running on port ${port}`);
  });
  return db;
}

connectToDb();
