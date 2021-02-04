//封装数据库的数据逻辑
// 引入mongodb模块
const MongoClient = require('mongodb').MongoClient;
// Connection URL
const url = 'mongodb://localhost:27017';
// Database Name
const dbName = 'test';

module.exports = {
    //发送信息并跳转功能
    sendMsg(response, mess, url){
        response.setHeader('content-type', 'text/html');
        response.send(`<script>alert("${mess}");window.location.href="${url}"</script>`);
    },
    //查询
    find(collectionName, query, callback){
        MongoClient.connect(url, {useNewUrlParser: true}, function(err, client) {
            const db = client.db(dbName);
            // 查询数据
            db.collection(collectionName).find(query).toArray(function(err, doc) {
                client.close();
                callback(err, doc);
            });
        });
    },
    //新增
    insert(collectionName, doc, callback){
        MongoClient.connect(url, {useNewUrlParser: true}, function(err, client) {
            const db = client.db(dbName);
            db.collection(collectionName).insertOne(doc, (err, result)=>{
                client.close();
                // 传递出去
                callback(err, result);
            })
        });
    },
    //删除
    delete(collectionName, query, callback){
        MongoClient.connect(url, {useNewUrlParser: true}, function(err, client) {
            const db = client.db(dbName);
            db.collection(collectionName).deleteOne(query, (err, result)=>{
                client.close();
                callback(err, result);
            })
        })
    },
    //修改
    update(collectionName, query, doc, callback){
        MongoClient.connect(url, {useNewUrlParser: true}, function(err, client) {
            const db = client.db(dbName);
            db.collection(collectionName).updateOne(query, {$set: doc}, (err, result) =>{
                client.close();
                callback(err, result)
            })
        })
    }
}