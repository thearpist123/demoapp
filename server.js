import path from 'path';
import express from 'express';
import bodyParser from 'body-parser';
import LdapStrategy from 'passport-ldapauth';
import passport from 'passport';
import mongoose from 'mongoose';
import ldap from 'ldapjs';

mongoose.Promise = global.Promise;

mongoose
    .connect(
        'mongodb://localhost:27017/postData',
        { useNewUrlParser: true })
    .then(
        () => { console.log('Database is connected'); },
        (err) => { console.log(`Can not connect to the database ${err}`); }
    );
    
const Thread = new mongoose.Schema({
    content: String,
    likes: [String],
    date: Date,
    poster: String,
    comments: [{
        content: String,
        likes: [String],
        date: Date,
        poster: String,
        _id: mongoose.Schema.Types.ObjectId
    }]
  }, { collection: 'Threads', timestamp: false });
const ThreadModel = mongoose.model('Thread', Thread);
  

passport.use(new LdapStrategy({
    server: {
        url: 'ldap://localhost:389',
        bindDN: 'cn=admin,dc=my-company,dc=com',
        bindCredentials: '123456',
        searchBase: 'dc=my-company,dc=com',
        searchFilter: '(cn={{username}})'
    }
}));

passport.serializeUser(function(user, cb) {
  cb(null, user.cn);
});

passport.deserializeUser(function(cn, cb) {
  cb(null, {username: cn});
});

const isAuthenticated = function (req, res, next) {
  if(req.isAuthenticated()) return next();
  else res.redirect('/login')
}


let client = ldap.createClient({
    url: 'ldap:localhost:389'
});
client.bind('cn=admin,dc=my-company,dc=com', '123456', function(err){
    if(err) console.log(err);
    else console.log("Successfully bound to LDAP server");
});
function registerUser(req, res) {
    client.search('dc=my-company,dc=com', {
        filter: `(cn=${req.body.username})`,
        attributes: ['cn']
    }, function(err, response) {
        var noExistingUser = true;
        response.on('searchEntry', () => noExistingUser = false);
        response.on('end', () => {
            if(noExistingUser) {
                client.add(
                    `cn=${req.body.username},dc=my-company,dc=com`,
                    {sn: req.body.username, uid: req.body.username, cn: req.body.username, userPassword: req.body.password, objectClass: 'inetOrgPerson'},
                    err => {
                        if(err) res.status(500).send(err);
                        else res.status(200).send('User created successfully!');
                    }
                );
            } else {
                res.status(403).send('That username is taken');
            }
        })
    })
}

function newPost(req, res) {
    new ThreadModel({
        content: req.body.content,
        likes: [],
        date: new Date(),
        poster: req.username,
        comments: []
    }).save(err => {
      if(err) res.status(500).send("internal server error");
      else res.status(200).send();
});
}

function newComment(req, res) {
    ThreadModel.findOne({ _id: req.body._id }, (err, thread)=>{
        if(err) {res.status(500).send();}
        else {
            thread.comments.push({ content: req.body.content, likes: [], date: new Date(), poster: req.username, _id: new mongoose.Schema.Types.ObjectId()});
            ThreadModel.findOneAndUpdate({_id: req.body._id}, thread, (err) => {
                if(err) res.status(500).send();
                else res.status(200).send();
            });
        }
    });
}

function changeLikes(req, res) {
    ThreadModel.findOne({ _id: req.body._id }, (err, thread)=>{
        if(err) {res.status(500).send();}
        else {
        let likes = [];
            if(req.body.commentId) {
                var index = thread.comments.map(function(e) { return e._id; }).indexOf(req.body.commentId);
                likes = thread.comments[index].likes;
            }
            else {
        likes = thread.likes;
            }
        if(likes.indexOf(req.username) === -1) {
                    likes.push(req.username);
        } else {
            likes.splice(likes.indexOf(req.username), 1);
        }
            ThreadModel.findOneAndUpdate({_id: req.body._id}, thread, (err) => {
                if(err) res.status(500).send();
                else res.status(200).send();
            });
        }
    });
}

function getPosts(req, res) {
    ThreadModel.find({}, null,  {sort:{date: 1}}, (err, posts) => {
        if(err) res.status(500).send(err);
        else res.json(posts);
    })
}

const app = express();
app.use(require('morgan')('combined'));
app.use(require('express-session')({ secret: 'secret phrase', resave: false, saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'dist')));

app.post('/register', registerUser);
app.post('/login', passport.authenticate('ldapauth', { failureRedirect: '/login.html', session: true }), (req, res) => res.status(200).send('logged in'));
app.post('/toggleLike', isAuthenticated, changeLikes);
app.post('/newComment', isAuthenticated, newComment);
app.post('/newPost', isAuthenticated, newPost);
app.get('/posts', isAuthenticated, getPosts);
app.set('port', 80);
app.listen(80, () => console.log("Listening on port 80"));
