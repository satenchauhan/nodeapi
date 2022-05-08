const express = require("express");
const router = express.Router();
const createError = require('http-errors');
const User = require("../Models/User.model")
const { authSchema } = require('../helpers/validate_schema');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require("../helpers/jwt_auth");
const crypto = require('crypto');



router.post('/register', async(req, res, next) => {
        try {
                const ATK  = crypto.randomBytes(16).toString('hex');
                const RTK  = crypto.randomBytes(16).toString('hex');
                const {email, password,  access_secret, refresh_secret} = req.body;   
                const data = {
                     email:req.body.email, 
                     password : req.body.password,   
                     access_secret: ATK,
                     refresh_secret: RTK
                }
             // if(!email || !password) throw createError.BadRequest();
             const result = await authSchema.validateAsync(req.body);
             const doesExist = await User.findOne({email: result.email})
             if(doesExist)
                throw createError.Conflict(`${result.email} is already been registered`);

                const user = new User(data);
                const savedUser = await user.save();
                // const accessToken = await signAccessToken(savedUser.email)
                const accessToken = await signAccessToken(savedUser.id);
                const refreshToken = await signRefreshToken(savedUser.id);
                res.send({accessToken,refreshToken});
        } catch (error) {
               if(error.isJoi === true) error.status = 422
               next(error) 
        }
});


router.post('/login', async(req, res, next) => {
        try {
            const result = await authSchema.validateAsync(req.body);   
            const user = await User.findOne({email: result.email});
            console.log(user)
            if(!user) throw createError.NotFound("User not registered");

            const isMatch = await user.isValidPassword(result.password);
            if(!isMatch) throw createError.Unauthorized('Username/password is not valid');
            
            const accessToken = await signAccessToken(user.id);
            const refreshToken = await signRefreshToken(user.id);

            res.send({accessToken,refreshToken});
        } catch (error) {
            if(error.isJoi === true) 
               return next(createError.BadRequest("Invalid username/password"));
            next(error) 
        }
       
});


router.post('/refresh-token', async(req, res, next) => {
        try {
           const {refreshToken}   = req.body;
           const userId = await verifyRefreshToken(refreshToken);  

           const accessToken = await signAccessToken(userId);
           const refToken = await signRefreshToken(userId);
           res.send({ accessToken: accessToken, refreshToken: refToken });
        } catch (error) {
           next(error)
        }

});

router.delete('/logout', async(req, res, next) => {
       try {
          const {refreshToken} = req.body  
          if(!refreshToken) throw createError.BadRequest()
          const userId = await verifyRefreshToken(refreshToken);  
       } catch (error) {
           next()    
       }
})


module.exports = router;