const cafeModel = require("../schemas/cafeSchema");
const post = require("../schemas/postSchema");
const user = require("../schemas/userSchema");
const express = require("express");
const router = express.Router();

// current logged in user
var loggedInUser = "cinnamoroll";
var loggedInUserPfp = "https://i.pinimg.com/736x/96/c6/5d/96c65d40ec3d11eb24b73e0e33b568f7.jpg";
var loggedInUserId = 1001;

function errorFn(err){
    console.log('Error found');
    console.error(err);
}

function calculateAverageRating(posts) {
    let totalRating = 0;
    posts.forEach(post => {
        totalRating += post.rating;
    });
    return totalRating / posts.length;
}

router.get('/view_cafe', function(req,resp){
    const cafeid = req.query.id;
    const cafe_searchQuery = { cafeid: cafeid }; 

    cafeModel.findOne(cafe_searchQuery).lean().then(function(cafe){
        if (cafe) {
            post.find({ isPromo: false, storeid: cafeid }).lean().then(function(posts){
                const filteredPosts = posts.filter(post => post.storeid === cafeid);

                const authorIds = [...new Set(filteredPosts.map(post => post.authorid))];
                
                user.find({ userid: { $in: authorIds } }).lean().then(function(users){
                    const postsWithUserInfo = filteredPosts.map(post => {
                        const author = users.find(user => user.userid === post.authorid);
                        return {
                            ...post,
                            profpic: author ? author.profpic : null,
                            username: author ? author.username : null
                        };
                    });
                    // Calculate combined score (upvotes - downvotes) for each post
                    postsWithUserInfo.forEach(post => {
                        post.combinedScore = post.upvote - post.downvote;
                    });

                    postsWithUserInfo.sort((a, b) => {
                        if (a.rating !== b.rating) {
                            return b.rating - a.rating; // Sort by rating
                        } else {
                            return b.combinedScore - a.combinedScore; // Sort by combined score
                        }
                    });

                    // Calculate average rating of posts
                    const averageRating = calculateAverageRating(postsWithUserInfo);

                    // Update the rating field of the cafe document
                    cafe.rating = averageRating;

                    // Save the updated cafe document
                    cafeModel.updateOne(cafe_searchQuery, { $set: { rating: averageRating } }).then(() => {
                        var isLoggedIn;
                        if(cafe.ownerid===loggedInUserId){
                            isLoggedIn = true;
                        } else{
                            isLoggedIn = false;
                        }
                        resp.render('view-cafe', {
                            title: 'View Cafe | Coffee Lens',
                            'cafe-data': cafe,
                            'post-data': postsWithUserInfo,
                            userPfp: loggedInUserPfp,
                            loggedInUserId: loggedInUserId,
                            'isLoggedIn': isLoggedIn
                        });
                    }).catch(errorFn);
                }).catch(errorFn);
            }).catch(errorFn);
        } else {
            resp.status(404).send('Cafe not found');
        }
    }).catch(errorFn);
});


router.get('/view_all', function(req, resp){
    const searchQuery = {};
    cafeModel.find(searchQuery).lean().then(function(cafes){
        cafes.sort((a, b) => a.cafename.localeCompare(b.cafename));
        resp.render('view-all', {
            title: 'All Cafes | Coffee Lens',
            'cafe-data': cafes,
            userPfp: loggedInUserPfp,
            loggedInUserId: loggedInUserId
        });
    }).catch(errorFn);
});

router.get('/create_cafe', function(req,resp){
    resp.render('create-cafe', {
        title: 'Create Cafe | Coffee Lens'
    });
});


router.get('/edit_cafe', function(req,resp){
    resp.render('edit-cafe', {
        title: 'Edit Profile | Coffee Lens'
    });
});

module.exports = router;