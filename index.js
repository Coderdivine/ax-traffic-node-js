const express = require("express")
const app = express();
const cors = require("cors");
const port = process.env.PORT || 9099;
const mysql = require("mysql")
require("dotenv").config();
const db = mysql.createPool({
    user:process.env.AUTH_PASS_USER,
    host:process.env.AUTH_PASS_HOST,
    password:process.env.AUTH_PASS_PASSWORD,
    database:process.env.AUTH_PASS_DATABASE
});
const nodemailer = require('nodemailer');
//https://ax-traffic.herokuapp.com
//mysql://b2339583a1a018:84b18bff@us-cdbr-east-05.cleardb.net/heroku_4a937b3084a1ea2?reconnect=true
app.use(cors());
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
//products
const english = {
    "low":[
        {name:"name",
        message:"Your adviced to stay at a speed of",
        by:"CHIMDI.AI"
        }
    ],
    "normal":[
        {name:"name",
        message:"Your adviced to stay at a spedd of",
         by:"CHIMDI.AI"
        }
    ],
    "high":[
        {name:"name",
        message:"Your adviced to stay at a spedd of",
         by:"CHIMDI.AI"
        }
    ]
         
}
let emailTransporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.AUTH_PASS_EMAIL,
        pass: process.env.AUTH_PASS_PASSWORD
    }
});
//post routes
//1
app.get("/english",(req,res)=>{
    res.send(english)
})
app.post("/post-user",(req,res)=>{
    const {username,email,phone,password,long,lat,verified,img,date,ads} = req.body;

    db.query('INSERT INTO userdb (username,email,phone,password,longitude,latitude,verified,img,date,ads)VALUES(?,?,?,?,?,?,?,?,?,?)',[username,email,phone,password,long,lat,verified,img,date,ads],(err,result)=>{
            if(err){
                console.log(err)
                res.send(false)
            }else{
                const id = result[0].id;
                let messaged = {
                    from: "axgurah@gmail.com",
                    to: email,
                    subject: `verification link`,
                    html: `                
                    <div>
                    <div id="header" style="text-align:center;background:#d2691e;color:#fff;padding:5px 12px;border-radius:5px;font-style:sans-serif;">
                    <h1>AXGURA</h1>
                    </div>
                    <section id="body" style="margin:0;padding:0;box-sizing:border-box;background:whitesmoke;border-radius:6px;padding:6px 18px;font-style:sans-serif;">
                    <small style="font-style:sans-serif;">Your verification link</small>
                    <a href="https://ax-traffic.herokuapp.com/verify-user/passed/${id}" style="padding:12px 18px;margin:13px 6px;background:#2596be;border:0;border-radius:6px;text-decoration:none;color:white;text-align:center;" >Visit Website</a>
                    </section>
                    
                    </div>`
                };
                emailTransporter.sendMail(messaged, function (err, data) {
                    if (err) {
                        console.log(err);
        
                    } else {
                        res.send("Please check your email to verify your account.")
                    }
                })
            }
    })
   
});
app.post("/user-login/:pass",(req,res)=>{
    if(req.params.pass!=="passed"){
        return
    }
    const {username,password} = req.body;
    db.query(`SELECT * FROM userdb WHERE (username = '${username}' AND password = '${password}')`,(err,result)=>{
            if(err){
                res.send(false)
            }else{
                res.send(result)
            }
    })
   
});
app.get("/verify-user/:pass/:id",(req,res)=>{
    const {pass,id}=req.params;
    const verify = "true"
    db.query(`UPDATE userdb SET (verify = ?)WHERE id = ${id} ?`,[verify],(err,result)=>{
            if(err){
                return
            }else{
                //res.send('Your account is verified \n you can go back to the home page')
                res.redirect("https://ax-traffic.axgura.com")
            }
    })

})
app.get("/get-users/:pass",(req,res)=>{
    if(req.params.pass!=="passeded"){
        return
    }
    const QUERY = `SELECT * FROM userdb`;
    db.query(QUERY,(err,result)=>{
       if(err){
           res.send(false);
       }
       else{
           res.send(result)
       }
    })
});
//no valuenso
app.post("/user-update/:pass/:id",(req,res)=>{
    if(req.params.pass!=="passed"){
            return
    }
    const id  = req.params.id;
    const {phone,img}  = req.body;
    db.query(`UPDATE userdb SET (phone = ?, img = ?) WHERE id = ?`,[img,phone,id],(err,result)=>{
        if(err){
            res.send(`An error occured please try again later \n err:${err}`)
        }else{
                    res.send("Update successful")
        }
    })
});
app.post("/post-data/:pass",(req,res)=>{
    if(req.params.pass!=="passed"){
        console.log("passed")
    }
    const { period,time,lon,lat,date,avg} = req.body;
    db.query('INSERT INTO datadb (period,time,longs,lat,date,avg )VALUES(?,?,?,?,?,?)',[period,time,lon,lat,date,avg ],(err,result)=>{
            if(err){
                res.send(false)
            }else{
                res.send("Posted")
            }
    })
   
});
app.get("/get-data/:pass",(req,res)=>{
    if(req.params.pass!=="passed"){
        res.send("passed")
    };
    db.query("SELECT * FROM datadb",(err,result)=>{
        if(err){
            res.send(false)
        }else{
         res.send(data)
        }
    })
})
app.listen(port, () => {
    console.log(`Host now -00 on http://localhost:${port}`);
}) 
