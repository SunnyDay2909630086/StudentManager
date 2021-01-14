// 导入express模块
let express = require('express')
//验证码
let svgCaptcha = require('svg-captcha')
//path内置模块
let path = require('path')
//session模块
let session = require('express-session')
//body-parser模块,格式化表单数据
let bodyParser = require('body-parser')
// 引入mongodb模块
const MongoClient = require('mongodb').MongoClient;
// Connection URL
const url = 'mongodb://localhost:27017';
// Database Name
const dbName = 'test';

//创建app
let app = express();
//中间件
//设置托管静态资源
app.use(express.static('static'));
app.use(session({
  secret: 'keyboard cat'
}));
//使用body-parser中间件
app.use(bodyParser.urlencoded({ extended: false }))

//路由1
//访问登录页面，直接读取并返回
app.get('/login', (req, res)=>{
    console.log(req.session,'session');
    req.session.info = '到登录页啦。。'
    res.sendFile(path.join(__dirname,'static/views/login.html'))
})

//路由2
app.post('/login', (req, res)=>{
    console.log(req,'req');
    let userName = req.body.userName
    let userPass = req.body.userPass
    let code = req.body.code
    if(code == req.session.captcha){
        // console.log('验证码正确');
        //设置userInfo
        req.session.userInfo = {
            userName,
            userPass
        }
        res.redirect('/index');
    }else{
        // console.log('验证失败');
        res.setHeader('content-type', 'text/html')
        res.send('<script>alert("验证码失败");window.location.href="/login"</script>')
    }
})

//路由3，生成验证码的功能
//把地址设置给验证码的图片处
app.get('/login/captchaImg', (req, res)=>{
    var captcha = svgCaptcha.create();
    //打印验证码
    console.log(captcha.text);
    //获取session中的值
    // console.log(req.session.info,'info');
    req.session.captcha = captcha.text.toLocaleLowerCase();
    res.type('svg');
    res.status(200).send(captcha.data);
})

//路由4
//访问首页
app.get('/index', (req, res)=>{
    if(req.session.userInfo){
        res.sendFile(path.join(__dirname,'static/views/index.html'))
    }else{
        res.setHeader('content-type', 'text/html')
        res.send('<script>alert("验证码失败");window.location.href="/login"</script>')
    }
})

//路由5
//登出
app.get('/logout', (req,res)=>{
    delete req.session.userInfo
    res.redirect('/login')
})

//路由6
//注册
app.get('/register', (req,res)=>{
    res.sendFile(path.join(__dirname,'static/views/register.html'))
})

//路由7
app.post('/register', (req,res)=>{
    let userName = req.body.userName
    let userPass = req.body.userPass
    // Use connect method to connect to the server
    MongoClient.connect(url, function(err, client) {
        const db = client.db(dbName);
        //选择使用的集合
        const collection = db.collection('user');
        // 查询数据
        collection.find({
            userName
        }).toArray(function(err, doc) {
            console.log(doc,'doc')
            if(doc.length==0){
                // 没有数据就新增数据
                collection.insertOne({
                    userName,
                    userPass
                }, (err, result)=> {
                    console.log(err,'err');
                    //注册成功
                    res.setHeader('content-type', 'text/html');
                    res.send('<script>alert("欢迎入坑");window.location.href="/login"</script>');
                    client.close();
                });
            }
        });
        // client.close();
    });
    //接受数据
    //添加到数据库
    // 去登陆页
})

//开始监听
app.listen(8080, '127.0.0.1', ()=>{
    console.log('listen to http://127.0.0.1:8080/index success');
})