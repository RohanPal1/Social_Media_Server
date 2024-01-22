const express = require('express');
const dotenv = require('dotenv');
const authRouter = require('./routers/authRouter');
const postsRouter = require('./routers/postsRouter');
const userRouter = require('./routers/userRouter');
const dbConnect = require('./dbConnect');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const cloudinary = require('cloudinary').v2;

dotenv.config('./.env');

// Configuration     
cloudinary.config({ 
  secure: true,
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const app = express();

app.use(express.json({limit:'50mb'}));

// middlewares
app.use(morgan("common"));
app.use(cookieParser());
app.use(cors({
    credentials: true,
    origin: 'http://localhost:3000'
}));

// let origin = 'http://localhost:3000';
// if(process.env.NODE_ENV === 'production') {
//     origin = process.env.CLIENT_ORIGIN;
// }
// app.use(
//     cors({
//         credentials: true,
//         origin
//     })
// );



app.use('/auth', authRouter);
app.use('/posts',postsRouter );
app.use('/user', userRouter);

app.get('/', (req,res) => {
    res.status(200).send('OK from Server');
})


const PORT = process.env.PORT || 4001;

dbConnect();
app.listen(PORT, ()=> {
    console.log(`listening on port: ${PORT}` );
});
