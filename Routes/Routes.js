let express=require('express')
let expressValidator=require('express-validator')
let bodyParser=require('body-parser')
let Router=express.Router()
let mongoUser=require('../Model/user')
let bcrypt=require('bcryptjs')
let flash=require('express-flash')
let passport=require('passport')
let nodeMailer=require('nodemailer')




function LoggedIN(req,res,next){
    if(req.isAuthenticated()){
        return next()
      }else{
          req.flash('error','Login first to view this page')
        res.redirect('Login')
      }
  }

function notLoggedIN(req,res,next){
    if(req.isAuthenticated()){
        res.redirect('index')
      }else{
       return next()
      }
  
}



Router.get('/',notLoggedIN,(req,res)=>{
    res.render('Login')
})



Router.get('/Register',notLoggedIN,(req,res)=>{
    res.render('Register')
})


Router.post('/Register',(req,res)=>{

    //Validating the inputs
    let username=req.body.username
    let email=req.body.email
    let password=req.body.password

    req.checkBody('username','Username Must be 5 characters Long').notEmpty().escape().isLength({min:5,max:15})
    req.checkBody('email','enter a valid Email Address').notEmpty().isEmail()
    req.checkBody('password','Password must be at least 6 charcters long').notEmpty().isLength({min:6})

    let errors=req.validationErrors()

    if(errors.length){

        res.render('Register',{
            errors,
            username,
            email
        })
    }else{
        let errors=[]
        //Checking if user already exist
        
        mongoUser.find({email:email},(err,user)=>{
            if(err) throw err;
        if(user.length>0) {
            errors.push({msg:'Email Already Exist !!!Try Another Email Address'})
            res.render('Register',{
                errors,
                username,
                email
            })
        }else{
            let user={
                username,
                email,
                googleID:'',
                FBID:'',
                password
            }
            //hashing the password
            bcrypt.hash(user.password,10,(err,hashedPass)=>{
                if(err) throw err
                user.password=hashedPass
                
                //sAVING THE uSER TO db
                let newUser=new mongoUser(user)
                newUser.save((err,user)=>{
                    if(err) throw err
                    console.log(user)
                    req.flash('success_msg','Successfully Signed UP !!! Login Now')
                    res.redirect('/Login')
                     //Sending success Email

                var transport = nodeMailer.createTransport({
                    host: "smtp.mailtrap.io",
                    port: 2525,
                    auth: {
                      user: "7ab25ef12d0f8f",
                      pass: "633520db4989c2"
                    }
                  });

                  var mailOptions = {
                    from: '"CHATEHERE TEAM" <waqasktk81@gmail.com>',
                    to: user.email,
                    subject: 'Nice Nodemailer test',
                    text: 'Hey there, it’s our first message sent with Nodemailer ;) ', 
                    html: '<b>Hey there! </b><br> This is our first message sent with Nodemailer'
                };

                transport.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        return console.log(error);
                    }
                    console.log('Message sent: %s', info.messageId);
            });
                })
            })

        }
        })
    }
})




Router.get('/Login',notLoggedIN,(req,res)=>{
    res.render('Login')
})


Router.post('/Login',passport.authenticate('local',{
    successRedirect:'/index',
    failureRedirect:'/Login',
    failureFlash:true,
    successFlash:true
}),(req,res,next)=>{
})



Router.get('/index',LoggedIN,(req,res)=>{
    res.render('index',{user:req.user})
})


Router.get('/logout',(req,res)=>{
    req.logout()
    req.flash('success_msg','You are logged out')
  res.redirect('Login')
})


Router.get('/google',passport.authenticate('google',{
    scope:['profile','email']
    }))
   

Router.get('/google/callback',passport.authenticate('google'),(req,res)=>{
    res.redirect('/index')
})


Router.get('/facebook',passport.authenticate('facebook',{authType:'rerequest',scope:['email']},{

}))

Router.get('/facebook/callback',passport.authenticate('facebook'),(req,res)=>{
    res.redirect('/index')
})

module.exports=Router;