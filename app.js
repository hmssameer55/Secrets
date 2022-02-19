require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const ejs = require('ejs')
const makeDbConnection = require('./utils/db')
const userModel = require('./models/user.schema')
const session = require('express-session')
const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate')

const app = express()

app.use(express.static('public'))

app.set('view-engine', 'ejs')

app.use(bodyParser.urlencoded({ extended: true }))


app.use(session({
    secret: "HMS",
    resave: false,
    saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session())

passport.use(userModel.createStrategy())

passport.serializeUser((user, done)=> {
    done(null, user);
});

passport.deserializeUser((user, done)=> {
    done(null, user);
});

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "https://guarded-headland-22735.herokuapp.com/auth/google/secrets"
},
    function (accessToken, refreshToken, profile, cb) {
        userModel.findOrCreate({ googleId: profile.id }, function (err, user) {
            return cb(err, user);
        });
    }
));


app.get('/', (req, res) => {
    res.render("home.ejs")
})

app.get('/login', (req, res) => {
    res.render("login.ejs")
})

app.post('/login', passport.authenticate('local', { failureRedirect: '/register' }),
    (req, res) => {
        res.redirect('/secrets');
    });

app.get('/logout', (req, res) => {
    req.logOut()
    res.redirect('/')
})

app.get('/auth/google',
    passport.authenticate('google', {
        scope: ['profile', 'email']
    })
);

app.get('/auth/google/secrets', passport.authenticate('google', {
    successRedirect: '/secrets',
    failureRedirect: '/login'
}));

app.get('/register', (req, res) => {
    res.render("register.ejs")
})

app.post('/register', async (req, res) => {

    const user = await userModel.findOne({username:req.body.username})
    if(user){
        res.redirect('/login')
        return
    }
  
    try {
        const user = await userModel.register({ username: req.body.username }, req.body.password)
        if (user) {
            passport.authenticate("local")(req, res, () => {
                res.redirect("/secrets")
            })
        } else {
            res.redirect('/register')
        }

    } catch (err) {
        console.log(err)
    }

})

app.get('/secrets', async (req, res) => {
    if (req.isAuthenticated()) {
    try {      
       const foundedUsers = await userModel.find({ "secret": { $ne: null } })
        if (foundedUsers) {
            res.render("secrets.ejs", { usersWithSecrets: foundedUsers })
            return
        }
    } catch (err) {
        console.log(err)
    }
}else{
 res.redirect("/login")
}
})

app.get('/submit', (req, res) => {
    if (req.isAuthenticated()) {
        res.render("submit.ejs")
    } else {
        res.redirect("/login")
    }
})

app.post('/submit', async (req, res) => {

    const secret = req.body.secret
    try {
        const user = await userModel.findById(req.user._id)
        if (user) {
            user.secret.push(secret)
            user.save(() => { res.redirect('/secrets'); });
        } else {
            res.redirect('/register')
        }
    } catch (err) {
        console.log(err)
    }
})

app.listen(process.env.PORT || 3000, () => {
    console.log("listening at 3000")
    makeDbConnection()
})