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
//使用自己抽取的工具函数
let myTools = require(path.join(__dirname, 'tools/my-tools'))
// 路由模块
let indexRoute = require(path.join(__dirname, 'router/indexRoute.js'))

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
//使用index路由中间件挂载到/index这个路径下
app.use('/index', indexRoute);
// 引入art-template
app.engine('art', require('express-art-template'));
app.set('views', '/static/views');

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
        // 验证用户名和密码
        myTools.find('user', {userName, userPass}, (err, docs)=>{
            if(!err){
                // console.log(docs,'docs');
                if(docs.length == 1){
                    // 保存session
                    req.session.userInfo = {
                        userName
                    }
                    //去首页
                    myTools.sendMsg(res, '欢迎来到首页', '/index');
                }else{
                    // 用户名或密码错误
                    myTools.sendMsg(res, '用户名或密码错误', '/login');
                }
            }
        })
    }else{
        // console.log('验证失败');
        myTools.sendMsg(res, '验证码失败', '/login')
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
        myTools.sendMsg(res, '验证码失败', '/login')
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
    //接受数据
    let userName = req.body.userName
    let userPass = req.body.userPass
    // Use connect method to connect to the server
    myTools.find('user', { userName }, (err, doc)=>{
        if(doc.length == 0){
            //新增数据
            myTools.insert('user', { userName, userPass }, (err, result)=>{
                if(!err){
                    myTools.sendMsg(res, '欢迎入坑', '/login')
                }
            })
        }else{
            //已被注册
            myTools.sendMsg(res, '很遗憾已被使用', '/register')
        }
    })
})

//开始监听
app.listen(8080, '127.0.0.1', ()=>{
    console.log('listen to http://127.0.0.1:8080/index success');
})