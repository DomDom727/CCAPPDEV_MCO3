/*Install Command:
    npm init
    npm i express express-handlebars body-parser mongoose
*/

const express = require('express');
const server = express();

const bodyParser = require('body-parser')
server.use(express.json()); 
server.use(express.urlencoded({ extended: true }));

const handlebars = require('express-handlebars');

const hbs = handlebars.create({
    extname: 'hbs',
    defaultLayout: 'index',
    helpers: {
        generateStarIcons: function(rating){
            let stars = '';
            for (let i = 0; i < rating; i++) {
                stars += '<span class="material-icons">star_rate</span>';
            }
            return stars;
        }
    }
});

// Set Handlebars engine in Express
server.engine('hbs', hbs.engine);
server.set('view engine', 'hbs');

server.use(express.static('public'));

//for the DB
const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://user:appdevmco2@cluster0.gysra2q.mongodb.net/mco');

// schemas
const commentSchema = new mongoose.Schema({
    upvote: { type: Number }, 
    downvote: {type: Number},
    content: {type: String},
    authorid: {type: Number}, 
    dateposted: {type: String}
},{ versionKey: false });

const cafeSchema = new mongoose.Schema({
    cafeid: {type: Number}, 
    cafename: {type: String},
    ownerid: {type: Number}, 
    logo: {type: String},
    rating: {type: Number},
    cafedesc: {type: String}
 },{ versionKey: false });

const postSchema = new mongoose.Schema({
    authorid: {type: Number},
    createdate: {type: String},
    updatedate: {type: String},
    dateposted: {type: String},
    upvote: { type: Number }, 
    downvote: {type: Number},
    title: {type: String},
    description: {type: String},
    image: {type: String},
    isPromo: {type: Boolean}
 },{ versionKey: false });

 const userSchema = new mongoose.Schema({
    userid: { type: Number }, 
    username: {type: String},
    password: { type: Number}, 
    profpic: {type: String},
    joindate: {type: String},
    isOwner: {type: Boolean}
 },{ versionKey: false });

// models
const commentModel = mongoose.model('comment',commentSchema);
const cafeModel = mongoose.model('store',cafeSchema);
const postModel = mongoose.model('post',postSchema);
const userModel = mongoose.model('user',userSchema);

function errorFn(err){
    console.log('Error found');
    console.error(err);
}

/* ACTUAL CODE FOR MAIN PAGE:
    server.get('/', function(req,resp){
        resp.render('main',{
            layout: 'index',
            title: 'Home | Coffee Lens'
        });
    }); 
*/

// for testing retrieval of data
server.get('/', function(req,resp){
    const searchQuery = {};
    commentModel.find(searchQuery).lean().then(function(comments){
        cafeModel.find(searchQuery).lean().then(function(cafes){
            userModel.find(searchQuery).lean().then(function(users){
                postModel.find(searchQuery).lean().then(function(posts){
                    resp.render('main', {
                        layout: 'index',
                        title: 'Home | Coffee Lens',
                        'comments-data': comments,
                        'cafe-data': cafes,
                        'user-data': users, 
                        'post-data': posts
                    });
                }).catch(errorFn);  // postmodel fn
            }).catch(errorFn);  // usermodel fn
        }).catch(errorFn);      //cafemodel fn
    }).catch(errorFn); // commentmodel fn
});

server.get('/login', function(req,resp){
    resp.render('login',{
        title: 'Log In | Coffee Lens'
    });
}); 

server.get('/create_acc', function(req,resp){
    resp.render('create-acc',{
        title: 'Log In | Coffee Lens'
    });
}); 

server.get('/edit_profile', function(req,resp){
    resp.render('edit-profile',{
        title: 'Edit Profile | Coffee Lens'
    });
}); 

server.get('/about', function(req,resp){
    resp.render('about',{
        title: 'About | Coffee Lens'
    });
}); 

server.get('/view_cafe', function(req,resp){
    const cafeid = req.query.id;
    const cafe_searchQuery = { cafeid: cafeid }; 
    const searchQuery = {};
    cafeModel.findOne(cafe_searchQuery).lean().then(function(cafe){
        if (cafe) {
            userModel.find(searchQuery).lean().then(function(users){
                postModel.find(searchQuery).lean().then(function(posts){
                    resp.render('view-cafe', {
                        title: 'View Cafe | Coffee Lens',
                        'cafe-data': cafe,
                        'user-data': users, 
                        'post-data': posts
                    });
                }).catch(errorFn);
            }).catch(errorFn);
        } else {
            resp.status(404).send('Cafe not found');
        }
    }).catch(errorFn);
}); 

server.get('/view_all', function(req, resp){
    const searchQuery = {};
    cafeModel.find(searchQuery).lean().then(function(cafes){
        resp.render('view-all', {
            title: 'All Cafes | Coffee Lens',
            'cafe-data': cafes 
        });
    }).catch(errorFn);
});


server.get('/view_profile', function(req,resp){
    resp.render('view-profile',{
        title: 'Profile | Coffee Lens'
    });
}); 

server.get('/edit_review', function(req,resp){
    resp.render('edit-review',{
        title: 'Edit Review | Coffee Lens'
    });
}); 

server.get('/edit_promo', function(req,resp){
    resp.render('edit-promo',{
        title: 'Edit Promo Post | Coffee Lens'
    });
}); 

server.get('/post_promo', function(req,resp){
    resp.render('post-promo',{
        title: 'Post A Promo | Coffee Lens'
    });
}); 

server.get('/post_review', function(req,resp){
    resp.render('post-review',{
        title: 'Post A Review | Coffee Lens'
    });
}); 


const port = process.env.PORT | 9090;
server.listen(port, function(){
    console.log('Listening at port '+port);
});