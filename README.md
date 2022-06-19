# 本地考试 OJ Exam App

本应用需要配合 SUM OJ 来使用。

## 开发环境：

- Window 10 操作系统
- Visual Studio Code 开发软件

## 使用框架：

- Electron 13.6.0
- Electron-edge-js 14.16.1
- electron-packager 15.4.0
- nodeJs 10.20.0
- iconv-lite 0.6.3

> 框架作用描述：
>
> 1. electron 框架是整体的基础框架，在该框架下，可以实现将前端进行一个桌面化，包括监控U盘，自动获取本地IP等功能。
> 2. electron-edge-js 包是配合 electron 框架进行监控U盘的，该框架可以嵌入 C#。
> 3. electron-packager 包是用来打包应用的。
> 4. iconv-lite 解析，用来解析 cmd 命令行后的字符串，因为存在中文乱码问题

> `特别说明：特别注意的是，几个版本信息需要对应，因为存在兼容的问题，在开发的过程中大量的时间花在的环境搭建上，特别是 electron-edge-js 该框架要求 electron 必须是 13.x.x 版本的。`
> `打包命令：npm run-script packager-pro-w64 `

## 版本说明：

- 版本 1.0.0 (2022-01-03)：该版是最初版本，实现了基本的自动获取本地 IP 上传到服务器中。
- 版本 2.0.0 (2022-01-04)：添加了监控 U 盘功能，同时调整了自动获取本地 IP 的实现代码，并且也禁止程序通过右上角菜单栏中关闭的功能.
- 版本 3.0.0 (2022-01-05)：优化了监控到 U 盘插入时，界面的提示效果。更换了依赖包，并且使用了 electron-packager 来打包程序.
- 版本 4.0.0 (2022-01-06)：添加了网络限制问题，该版本不建议在学生机子上进行测试！！！
- 版本 5.0.0 (2022-02-27)：添加了 FTP 监控功能.
- 版本 5.1.0 (2022-03-01)：修改 U 盘判断功能，修复将软盘判断进去的问题，实现的功能上，排除 A,B 两个盘符.
- 版本 5.2.0 (2022-03-07)：修改 FTP 监控功能，增强了网络限制的问题，对其进行 80 和 443 两个端口的防火墙设置。

## 部署注意事项：

### 一、版本分为两个版本，需要注意区分。

- localhost：本地运行版本，主要用于开发人员在本地进行测试的，在几个页面中，需要注意一下几个页面：
  - index.html 页面中的 webview 标签的 src 属性是：http://localhost:8080/oj 
  - index.js 页面中发送本机 ip 给服务器的请求地址是：http://localhost:8080/oj/lockip
  - main.js 页面中开发时，可以将 mainWindow.webContents.openDevTools(); 注释去除，方便查看控制台信息
- dev：发行版本，主要是进行测试的版本，同样也需要注意一下几个页面：
  - index.html 页面中的 webview 标签的 src 属性是：http://218.67.55.247:8060/oj
  - index.js 页面中发送本机 ip 给服务器的请求地址是：http://218.67.55.247:8060/oj/lockip
  - main.js 页面中开发时，一定要将 mainWindow.webContents.openDevTools(); 代码去掉！

### 二、打包环境问题

- 需要注意打包的过程中，注意运行的环境是 ia32 还是 x64，也就是系统是 window 64 位的电脑，还是 window 32 位的。

- 打包成 ia32 时和打包成 x64 位的命令有些的不同

  ```json
  "packager-dev-w32": "electron-packager . OJ_Exam_local --out app_local --platform=win32 --arch=ia32 --overwrite --icon=./icon/favicon.ico --electron-version=13.6.0",
  
  "packager-dev-w64": "electron-packager . OJ_Exam_local --out app_local --arch=x64 --overwrite --icon=./icon/favicon.ico --electron-version=13.6.0",
  ```

  具体的内容可以在 package.json 文件中查看。

### 三、安装环境说明

- 将安装包直接解压，需要解压对应环境的版本，32位的机子解压 i32 版本的，64位的机子解压 x64 的版本
- 不要放在一个含有中文路径的文件夹中
- 打开时必须使用管理员打开，如果遇到杀毒软件拦截的，需要允许，否则将无法正常启动

