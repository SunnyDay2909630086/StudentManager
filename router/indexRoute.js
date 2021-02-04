//路由中间件
let express = require('express');
let indexRoute = express.Router();
let path = require('path');
let myTools = require(path.join(__dirname, '../tools/my-tools'));
//使用mongodb包装ID
let objectId = require('mongodb').ObjectId

// 注册路由
indexRoute.get('/', (req, res)=>{
    if(req.session.userInfo){
        let userName = req.session.userInfo.userName;
        res.render(path.join(__dirname, '../static/views/index.art'), {
            userName
        });
    }else{
        myTools.sendMsg(res, '验证码失败', '/login')
    }
})

//新增数据
indexRoute.get('/insert', (req, res)=>{
    // 接受数据
    // console.log(req.query,'query');
    myTools.insert('user', req.query, (err, result)=>{
        if(!err) res.json({
            mess:"新增成功",
            code: 200
        })
    })
})

//删除数据
indexRoute.get('/delete', (req, res)=>{
    // console.log(req.query, 'query');
    let deleteId = req.query.id;
    myTools.delete('user', {_id:objectId(deleteId)}, (err, result)=>{
        if(!err) res.json({
            mess: '删除成功',
            code: 200
        })
    })
    //提示用户
    // res.send("delete")
})

//修改数据
indexRoute.get('/update', (req, res)=>{
    let name=req.query.name
    let age=req.query.age
    let phone=req.query.phone
    myTools.update('user', {_id:objectId(req.query.id)}, {name, age, phone}, (err,result)=>{
        if(!err) res.json({
            mess:"修改成功",
            code: 200,
            list: docs
        });
    })
    //提示用户
    // res.send("update")
})

//获取所有数据
indexRoute.get('/list', (req, res)=>{
    myTools.find('user', {}, (err, docs)=>{
        if(!err) res.json({
            mess:'数据',
            code: 200,
            list: docs
        });
    })
})

//根据名字获取数据
indexRoute.get('/search', (req, res)=>{
    //需要传递参数userName过来
    let name = req.query.userName;
    //加正则实现模糊查询
    myTools.find('user', {name:new RegExp(name)}, (err, docs)=>{
        if(!err) res.json({
            mess: '数据',
            code: 200,
            list: docs
        })
    })
})

//暴露出去
module.exports = indexRoute;