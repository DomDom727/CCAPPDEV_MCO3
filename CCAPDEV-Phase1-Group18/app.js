const express = require('express');
const server = express();

const bodyParser = require('body-parser')
server.use(express.json()); 
server.use(express.urlencoded({ extended: true }));

const handlebars = require('express-handlebars');
server.set('view engine', 'hbs');
server.engine('hbs', handlebars.engine({
    extname: 'hbs',
    defaultLayout: 'index'
}));

server.use(express.static('public'));

//add code here
server.get('/', function(req,resp){
    resp.render('main',{
        layout: 'index',
        title: 'Home | Coffee Lens'
    });
});


const port = process.env.PORT | 9090;
server.listen(port, function(){
    console.log('Listening at port '+port);
});