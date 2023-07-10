const express = require("express");
// require mongoose
const mongoose = require("mongoose");
const { Schema } = mongoose;
const bodyParser = require("body-parser");
const _ = require('lodash');
const port = 3000;
const app = express();

//Listening on port 3000 and if it goes well then logging a message saying that the server is running
app.listen(process.env.PORT || port, function(req, res){
  console.log('Server is connected to port ' + port + ' ...');
});

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public")); // use to store static files like images css

mongoose.connect('mongodb://127.0.0.1:27017/wikiDB');

const articleSchema = {
  title: String,
  content: String
};

const Article = mongoose.model('Article', articleSchema);

////////////////////////////////////// Request targetting all articles ///////////////////////////////////

// using express app.route(). chainable route to reduce redundacy and typos
app.route('/articles')
// use PostMan to get request rather than creating frontend input
.get(function(req,res){
  Article.find()
   .then(function(foundArticles){ // chained method
     //console.log(foundArticles);
     res.send(foundArticles);
     console.log("found");
   }).catch(function(err){       // chained method
     res.send(err);
   });
})

// use PostMan to post request rather than creating frontend input
.post(function(req, res){
  const articleTitle = req.body.title;
  Article.findOne({title: articleTitle})
  .then(function(articleSearch) {
    if (!articleSearch) {
      const post = new Article ({
        title: req.body.title,
        content: req.body.content
      });
      post.save().then(function(){
        res.send("Succesfully");
      }).catch(function(err) {
        res.send(err);
      });
    }
    else {
      res.send("Already in database");
      //console.log(articleSearch);
    }
  }).catch(function(err) {
    console.log(err);
  });
})

// use PostMan to delete request rather than creating frontend input
.delete(function(req, res){
  Article.deleteMany()
   .then(function(articleDelete){
     if (!articleDelete) {
       res.send("Nothing deleted");
     }
     else {
       console.log(articleDelete);
       res.send("(All)" + articleDelete.deletedCount + " articles deleted");
     }
   }).catch(function(err){
     res.send(err)
     console.log(err);
   });
});  // close the chain

///////////////////////////////////////// Request targetting specific article ///////////////////////////////////

app.route("/articles/:articleTitle")
.get(function(req, res){
  Article.findOne({title: req.params.articleTitle})
   .then(function(findArticle){
     if (!findArticle) {
       //console.log(findArticle);
       res.send("path not found");
     }
     else {
       res.send(findArticle);
     }
   }).catch(function(err){
     res.send(err);
   });
})

.put(function(req, res){ // PUT replace the entire resources
  // Check if the path name exist in the database
  Article.findOne({title: req.params.articleTitle})
  .then(function(findPut){
    // path doesn't exist, log an error
    //if (!findPut) {
    if (findPut === null) {
      res.send(req.params.articleTitle + " is a Wrong path.");
    }
    // pathname exist code should go ahead and opdate
    else {
      Article.updateOne({title: req.params.articleTitle}, {title: req.body.title,
         content: req.body.content})
      .then(function(putArticle){
        //console.log(putArticle);
        //if (!putArticle {
        if (putArticle.acknowledged === false) {
          res.send("Nothing to update");
        }
        else {
          res.send("Succesfully updated " + req.params.articleTitle + ".");
        }
      }).catch(function(err){
        console.log(err);
      });
    }
  }).catch(function(err){
    res.send(err);
  });
})

.patch(function(req, res) { // PATCH replace a specific resources
  // Check if the path name exist in the database
  Article.find({title: req.params.articleTitle})
  .then(function(findPatch){
    // path doesn't exist, log an error
    // if (!findPatch) {
    if (findPatch === null) {
      //console.log(req.params.articleTitle);
      res.send(req.params.articleTitle + " is a wrong path.");
    }
    // pathname exist code should go ahead and opdate
    else {
      Article.updateOne({title: req.params.articleTitle}, {$set: req.body}) // $set allow flexible parsed data irrespective of parsed body.
      .then(function(patchArticle){
        //console.log(patchArticle);
        if (patchArticle.acknowledged === false) {
          res.send("Nothing to update");
        }
        else {
          res.send("Succesfully updated " + req.params.articleTitle + ".");
        }
      }).catch(function(err){
        res.send(err);
      });
    }
  }).catch(function(err){
    res.send(err);
  });
})

.delete(function(req, res){  // delete resources
  Article.findOne({title: req.params.articleTitle})
  .then(function(findDelete){
    if (findDelete === null) {
      res.send(req.params.articleTitle + " path not found.");
    }
    else {
      Article.deleteOne({title: req.params.articleTitle}).
       then(function(deleteArticle){
         console.log(deleteArticle);
         if (!deleteArticle) {

           res.send("Nothing to delete");
         }
         else {
           res.send(" Succesfully deleted" );
           console.log(req.body);
         }

       }).catch(function(err){
         res.send(err);
       });
    }
  });
});




// without using app.route
// // use PostMan to get request rather than creating frontend input
// app.get('/articles', function(req,res){
//   Article.find()
//    .then(function(foundArticles){
//      //console.log(foundArticles);
//      res.send(foundArticles);
//      console.log("found");
//    }).catch(function(err){
//      res.send(err);
//    });
// });
//
// // use PostMan to post request rather than creating frontend input
// app.post('/articles', function(req, res){
//   const articleTitle = req.body.title;
//   Article.findOne({title: articleTitle})
//   .then(function(articleSearch) {
//     if (!articleSearch) {
//       const post = new Article ({
//         title: req.body.title,
//         content: req.body.content
//       });
//       post.save().then(function(){
//         res.send("Succesfully");
//       }).catch(function(err) {
//         res.send(err);
//       });
//     }
//     else {
//       res.send("Already in database");
//       //console.log(articleSearch);
//     }
//   }).catch(function(err) {
//     console.log(err);
//   });
// });
//
// // use PostMan to delete request rather than creating frontend input
// app.delete('/articles', function(req, res){
//   Article.deleteOne({ title: "Jack Bauer"})
//    .then(function(articleDelete){
//      if (!articleDelete) {
//        res.send("Nothing deleted");
//      }
//      else {
//        console.log(articleDelete);
//        res.send(articleDelete);
//      }
//    }).catch(function(err){
//      res.send(err)
//      console.log(err);
//    });
// });
