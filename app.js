// 导入express模块
let express = require('express')
//验证码
let svgCaptcha = require('svg-captcha')
//path内置模块
let path = require('path')
//session模块
let session = require('express-session')

//创建app
let app = express();
//中间件
//设置托管静态资源
app.use(express.static('static'));
app.use(session({
  secret: 'keyboard cat'
}))

//路由1
//访问登录页面，直接读取并返回
app.get('/login', (req, res)=>{
    console.log(req.session,'session');
    req.session.info = '到登录页啦。。'
    res.sendFile(path.join(__dirname,'static/views/login.html'))
})

//路由2，生成验证码的功能
//把地址设置给验证码的图片处
app.get('/login/captchaImg', (req, res)=>{
    var captcha = svgCaptcha.create();
    //打印验证码
    console.log(captcha.text);
    //获取session中的值
    // console.log(req.session.info,'info');
    req.session.captcha = captcha.text;
    res.type('svg');
    res.status(200).send(captcha.data);
})

//开始监听
app.listen(8080, '127.0.0.1', ()=>{
    console.log('listen to http://127.0.0.1:8080 success');
})