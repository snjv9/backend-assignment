const express = require('express');
const mongoose = require('mongoose')
const routes = require('./routes')

const app = express();

const url = 'mongodb+srv://snjv9:snjv12345@cluster0.cw29j.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'

mongoose.connect(url,{useUnifiedTopology: true,useNewUrlParser:true})
const con = mongoose.connection
con.on('open',function(){
    console.log('Connected to database');
})
app.use(express.urlencoded({extended:false}))
app.use(express.json())
app.use('/api',routes)



app.listen(5000,()=>{
    console.log('Server Listening at 5000')
})
                    

             
                 
                
