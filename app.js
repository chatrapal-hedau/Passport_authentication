var express                 = require('express'),
    mongoose                = require('mongoose'),
    passport                = require('passport'),
    User                    = require('./models/user'),
    localStrategy           = require('passport-local'),
    bodyParser              = require('body-parser'),
    passportLocalMongoose   = require('passport-local-mongoose'),
    keys                    = require('./keys.js')

var app = express();
app.set('view engine', "ejs");

app.use(bodyParser.urlencoded({extended:true}));

app.use(require("express-session")({
    secret :"That's a wonderful camping sites",
    resave : false,
    saveUninitialized : false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

mongoose.Promise =global.Promise;
mongoose.connect(keys,{
	useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
})
.then(() => console.log("MongoDB connected..."))
.catch(err => console.log(err));

//==================
//      Routes
//==================

app.get('/', function(req, res){
    res.render("home");
})

app.get('/secret', isLoggedIn, function(req, res){
    res.render('secret');
})

//Auth Routes
app.get('/register', function(req,res){
    res.render('register');
})

app.post('/register', function (req, res) {
    User.register(
      new User({ username: req.body.username }),
      req.body.password,
      function (req, response) {
        try {
          passport.authenticate('local')(req, response, function () {
            res.redirect('/secret');
          });
        } catch (err) {
          res.redirect('/register');
        }
      }
    );
  });

app.get("/login", function(req,res){
    res.render('login');
})

app.post("/login",passport.authenticate("local",{
    successRedirect :'/secret',
    failureRedirect :'/login'
}), function(req,res){

})

app.get("/logout", function(req,res){
    req.logout();
    res.redirect('/');
})

function isLoggedIn(req, res, next){
    if (req.isAuthenticated()){
        return next()
    }
    res.redirect('/login');
}
const port = 3000
app.listen(port, function(){
    console.log(`Server running on port ${port}`)
})