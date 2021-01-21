"use strict"
const http=require("http");
const fs=require("fs");
const express=require("express");
const cors=require("cors");
const bodyParser=require("body-parser");
const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken");
const session = require('express-session');
const exphbs = require('express-handlebars');
const cookieParser = require('cookie-parser');
const app = express();
const HEADERS = require("headers");
const PORT = process.env.PORT || 1337;
const DBNAME = "social";
const TTL=10; //espresso in secondi
const NO_COOKIES="No cookies found";
const CONNECTIONSTRING="mongodb+srv://tagaru_mgmt:pa55word@socialcluster.f3sp6.mongodb.net/social?retryWrites=true&w=majority";
const CONNECTIONOPTIONS = {useNewUrlParser: true, useUnifiedTopology: true};

let mongo=require("mongodb");
let mongoClient = mongo.MongoClient;
const ObjectId = mongo.ObjectID;

let paginaErrore;
let PRIVATE_KEY;

const server = http.createServer(app);
server.listen(PORT, function () {
    console.log("Server in ascolto sulla porta " + PORT);
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/static/index.html');
});

/*app.post('/login', (req, res) => {
    // Insert Login Code Here
    let email = req.body.email;
    let password = req.body.pass;
    res.send(`Username: ${username} Password: ${password}`);
});

app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/static/index.html');
});*/

init();

app.use(cors());

//Route di lettura dei parametri post
app.use(bodyParser.urlencoded({ "extended": true }));
app.use(bodyParser.json());

app.use(express.json({ "limit": "50mb" }));
app.set("json spaces", 4);

function init() {
    fs.readFile("./static/error.html", function (err, data) {
        if (!err)
            paginaErrore = data.toString();
        else
            paginaErrore = "<h1>Risorsa non trovata</h1>";
    });
    fs.readFile("./keys/private.key", function(err,data){
        if(!err){
            PRIVATE_KEY=data.toString();
        }
        else{
            //Richiamo la route di gestione degli errori
            //next(err);
            console.log("File mancante: private.key");
            server.close();
        }
    });
}

//Log della richiesta
app.use('/', function (req, res, next) {
    //originalUrl contiene la risorsa richiesta
    console.log(">>>>>>>>>> " + req.method + ":" + req.originalUrl);
    next();
});

//Log dei parametri
app.use("/", function (req, res, next) {
    if (Object.keys(req.query).length > 0)
    {
        console.log("Parametri GET: " + JSON.stringify(req.query));
    }
    if (Object.keys(req.body).length > 0)
    {
        console.log("Parametri BODY: " + JSON.stringify(req.body));
    }
    next();
});

//Route per fare in modo che il server risponda a qualunque richiesta anche extra-domain.
app.use("/", function (req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    next();
})

/********** Route specifiche **********/
app.post('/register', function(req, res, next) {
    mongoClient.connect(CONNECTIONSTRING, CONNECTIONOPTIONS, function(err, client) {
        let propic=req.body.Propic;
        let username=req.body.Username;
        let nome=req.body.Nome;
        let cognome=req.body.Cognome;
        let dob=req.body.DoB;
        let sesso=req.body.Sesso;
        let email=req.body.Email;
        let password=req.body.Password;
        let numTel=req.body.NumTel;

        if (err)
            res.status(503).send("Errore di connessione al database");
        else {
            const db = client.db(DBNAME);
            const collection = db.collection("accounts");
            collection.insertOne({"propic":propic,"username":username,"nome":nome,"cognome":cognome,"sesso":sesso,"dataNascita":dob,"email":email,"password":password,"numTel":numTel,"admin":false}, function(err, dbUser) {
                if (err) {
                    res.status(500).send("Errore inserimento nuovo record\n" + err.message);
                }
                else {
                    res.send(data);
                }
                client.close();
            });
        }
    });
});
//Per tutte le pagine sulle quali voglio controllare il token, aggiungo un listener di questo tipo
app.post('/api/login', function(req, res, next) {
    mongoClient.connect(CONNECTIONSTRING, CONNECTIONOPTIONS, function(err, client) {
        if (err)
            res.status(503).send("Errore di connessione al database");
        else {
            const db = client.db(DBNAME);
            const collection = db.collection("accounts");

            let email = req.body.email;
            collection.findOne({ "email": email }, function(err, dbUser) {
                if (err)
                    res.status(500).send("Internal Error in Query Execution");
                else {
                    if (dbUser == null)
                        res.status(401).send("Email or Password non validi");
                    else {
                        //req.body.password --> password in chiaro inserita dall'utente
                        //dbUser.password   --> password cifrata contenuta nel DB
                        //Il metodo compare() cifra req.body.password e la va a confrontare con dbUser.password
                        bcrypt.compare(req.body.pass, dbUser.password, function(err, ok) {
                            if (err)
                                res.status(500).send("Internal Error in bcrypt compare");
                            else {
                                if (!ok)
                                    res.status(401).send("Email or Password not allowed");
                                else {
                                    let token = createToken(dbUser);                                  
                                    writeCookie(res, token);
                                    console.log("token: "+token)
                                    res.send({ "ris": "ok" });
                                }
                            }
                        });
                    }
                }
                client.close();
            })
        }
    });
});

app.post("/", controllaToken);

app.post("./static/index.html", controllaToken);

app.use("/api", controllaToken);

function controllaToken(req, res, next) {
    let token = readCookie(req);
    if(token==NO_COOKIES)
    {
        inviaErrore(req, res, 403, "Token mancante");
    }
    else
    {
        jwt.verify(token, PRIVATE_KEY, function(err, payload){
            if(err)
            {
                //se la richiesta non è /api, bisogna mandare la pagina di login
                inviaErrore(req, res, 403, "Token scaduto o corrotto");
            }
            else
            {
                // ...vet per scomporlo
                let newToken=createToken(payload);
                writeCookie(res, newToken);
                req.payload=payload;
                next();
            }
        });
    }   
}

//Route relativa alle risorse statiche
app.use('/', express.static("./static"));

function inviaErrore(req, res, cod, errMex)
{
    if(req.originalUrl.startsWith("/api/"))
    {
        res.status(cod).send(errMex);
    }
    else
    {
        res.sendFile(`${__dirname}/static/index.html`);
    }
}

function readCookie(req){
    let valoreCookie=NO_COOKIES;
    if(req.headers.cookie){
        let cookies=req.headers.cookie.split(";");
        for(let item of cookies)
        {
            item=item.split("="); //item da chiave=valore --> [chiave, valore]
            if(item[0].includes("token"))
            {
                valoreCookie=item[1];
                break;
            }
        }
        //Trasforma cookies in un array di json
        //Object.fromEntries(cookies);
    }
    return valoreCookie;
}

//data --> record dell'utente
function createToken(data){
    //sign() --> si aspetta come parametro un json con i parametri che si vogliono mettere nel token
    let json={
        "_id":data._id,
        "username":data.username,
        "iat":data.iat || Math.floor(Date.now()/1000),
        "exp":Math.floor(Date.now()/1000)+TTL
    }
    let token=jwt.sign(json, PRIVATE_KEY);
    //console.log(token);
    return token;
}

function writeCookie(res, token){
    //set() --> metodo di express che consente di impostare una o più intestazioni nella risposta HTTP
    res.set("Set-Cookie", createCookie(token, TTL));
}

function createCookie(name, expires, domain, secure, httponly, path="/")
{
    if (typeof expires === 'string' || expires instanceof String)
    {
        return `token=${name};expires=${expires};domain=${domain};path=${path};httponly=${httponly};secure=${secure}`
    } 
    else
    {
        return `token=${name};max-age=${expires};domain=${domain};path=${path};httponly=${httponly};secure=${secure}`
    }
    
}

function createCookie(name, expires, httponly=true, path="/")
{
    if (typeof expires === 'string' || expires instanceof String) 
    {
        return `token=${name};expires=${expires};path=${path};httponly=${httponly}`
    } 
    else
    {
        return `token=${name};max-age=${expires};path=${path};httponly=${httponly}`
    }
    
}

/********** Route di gestione degli errori **********/

app.use("/", function (req, res, next) {
    res.status(404);
    if (req.originalUrl.startsWith("/api/"))
    {
        //res.send('"Risorsa non trovata"'); //non va così bene, perchè content-type viene messo = "text"
        res.json("Risorsa non trovata"); //La serializzazione viene fatta dal metodo json()
        //res.send({"ris":"Risorsa non trovata"});
    }
    else
    {
        res.send(paginaErrore);
    }
});

app.use(function (err, req, res, next) {
    if (!err.codice)
    {
        console.log(err.stack);
        err.codice = 500;
        err.message = "Internal Server Error";
        server.close();
    }
    res.status(err.codice);
    res.send(err.message);
})