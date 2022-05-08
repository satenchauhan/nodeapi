const express = require("express");
const morgan = require("morgan");
const createError = require('http-errors');
require('dotenv').config();
require('./helpers/init_mongodb')
const { verifyAccessToken } = require("./helpers/jwt_auth");
const AuthRoute = require('./Routes/Auth.route');
const User = require("./Models/User.model")


const app = express();
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.get('/',verifyAccessToken, async (req, res, next) => {
     res.send("Hello this rest api ");
});
app.get('/users',verifyAccessToken, async (req, res, next) => {
    const { email } = req.body; 
    console.log(email);
    const data = await User.findOne({email: email})
    res.send({"Id": data._id,"Email": data.email,"Password": data.password, "Access Secret Key": data.access_secret, "Refresh Key" : data.refresh_secret});
    // res.send(email);
});

app.use('/auth', AuthRoute);

app.use(async (req, res, next) => {
    // const error = new Error("Not Found");
    // error.status = 404;
    // next(error);
    next(createError.NotFound())
});

app.use((err, req, res, next) => {
    res.status(err.status || 500)
    res.send({
        error: {
            status: err.status || 500,
            message: err.message,
        }
    });
})


const PORT = process.env.PORT || 3000;

app.listen(PORT, ()  => {
      console.log(`Server running on ${PORT}`)  
});