var electron = require('electron')
var ipcRenderer = electron.ipcRenderer;
var os = require('os');

/**
 * 接收主进程发送的消息
 */
ipcRenderer.on('lc-active', (event, arg) => {
    if (arg == "lockIP") {
        sendIPToServer();
    } else if (arg == "getIP") {
        // 保存 ip 到 myHost 里头
        var myHost = getIPAdress();
        console.log("IP:" + myHost);
        // btoa 加密算法
        sessionStorage["myHost"] = btoa(myHost);
    }
})

/**
 * 获取本机 ip(内网IP)
 * @returns 内网 ip 地址
 */
function getIPAdress() {
    var myHost;
    var interfaces = os.networkInterfaces();
    for (var devName in interfaces) {
        var iface = interfaces[devName];
        for (var i = 0; i < iface.length; i++) {
            var alias = iface[i];
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                myHost = alias.address;
            }
        }
    }
    return myHost;
}

/**
 * 发送本机 ip 到服务器
 */
function sendIPToServer() {
    console.log("发送ip到服务器");
    var httpRequest = new XMLHttpRequest();
    // 打开连接
    httpRequest.open('POST', 'http://172.21.22.252:8060/oj/lockip', true);
    // 设置请求头注：post方式必须设置请求头（在建立连接后设置请求头）
    httpRequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    // 发送请求 将情头体写在send中
    httpRequest.send("ip=" + getIPAdress());
}