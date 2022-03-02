// 在主入口文件main.js编写代码(main.js是主进程)

// 引入 electron 模块
var electron = require('electron');
// 引入 path 模块
var path = require('path');
// 引入 nodeCmd 模块
var nodeCmd = require('node-cmd');
// 引入主进程模块
var ipcMain = electron.ipcMain;
// 系统文件读取模块
var fs = require('fs');
// 引入控制应用程序的事件生命周期模块
var app = electron.app;
// 引入消息弹窗模块
var dialog = electron.dialog;
// 嵌入 C# 代码依赖模块
var edge = require('electron-edge-js');
// 创建菜单类
var Menu = electron.Menu;
// 创建菜单子选项类
var MenuItem = electron.MenuItem;
// 主串口类
var BrowserWindow = electron.BrowserWindow;
// FTP监控循环定时器
var myInterval = null;
// 变量保存对应用窗口的引用
var mainWindow = null;
// 作弊标记
var isCheat = false;
// 去除安全警告
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

/**
 * 当 Electron 完成初始化时，发出一次
 */
app.on('ready', function () {
	initWindow();
})

/**
 * 当 Electron 初始化完成
 */
app.whenReady().then(() => {
	// 监控开启
	monitorWeb();	// 监控网络
	moitorUSB();	// 监控U盘
	moitorFTP();	// 监控FTP
})

/**
 * 在应用程序退出时发出
 */
app.on('quit', function () { })

/**
 * 渲染器进程意外消失时触发。 
 * 这种情况通常因为进程崩溃或被杀死。
 */
app.on('render-process-gone', function () { })


/**
 * 网络限制
 */
const monitorWeb = function () {
	var hostsFilePath = "C:\\Windows\\System32\\drivers\\etc\\hosts";
	// 读取限制网页的文件
	var newHosts = fs.readFileSync(path.resolve(__dirname, "./weblimit.txt"), 'utf-8');
	// 修改网络hosts文件读写权限
	fs.chmod(hostsFilePath, 0755, (err) => {
		if (err) {
			hostsError("修改网络文件读写权限失败", 4000);
			throw err;
		}
	})
	// 读取网络hosts文件
	fs.readFile(hostsFilePath, (err, data) => {
		// 读取发生错误时
		if (err) {
			hostsError("读取网络文件失败", 4000);
			throw err;
		}
		// 备份网络hosts文件
		fs.writeFileSync(path.resolve(__dirname, "./hosts"), data);
	});
	// 修改网络hosts文件
	fs.writeFile(hostsFilePath, newHosts, 'utf-8', (err) => {
		if (err) {
			hostsError("修改网络文件失败", 4000);
			throw err;
		}
	});
}

/**
 *  U盘监控
 */
const moitorUSB = function () {
	// 开启时扫描一遍盘符
	findUSB('0', findUHandle);
	// 钩住窗口消息, 当消息到达 WndProc 时调用方法 
	mainWindow.hookWindowMessage(0x0219, (wParam, lParam) => {
		// 调用检查 USB 方法
		findUSB('0', findUHandle);
	})
}

/**
 * FTP 监控
 */
const moitorFTP = function () {
	myInterval = setInterval(findFTP, 1000);
}

/**
 * 暂停 FTP 监控
 */
const stopMoitorFTP = function () {
	clearInterval(myInterval);
}

/**
 * 查询FTP端口21是否被占用
 */
const findFTP = function () {
	// netstat -aon|findstr :21
	nodeCmd.run('netstat -aon|findstr :21', function (err, data, stderr) {
		if (data.indexOf('ESTABLISHED') != -1) {
			console.log("作弊！！！");
			console.log(data);
			// 停止FTP监控
			stopMoitorFTP();
			// 作弊标记
			isCheat = true;
			// 发送消息给渲染进程进行 ip 锁定
			mainWindow.webContents.send('lc-active', "lockIP");
			// 显示提示信息
			mainWindow.loadFile("./error/error_ftp.html");
			// 取消窗口信息的钩子
			mainWindow.unhookWindowMessage(0x0219);
		}
	})
}

/**
 * 处理hosts网络文件出现错误后处理方法
 * @param {提示消息} message 
 * @param {显示时间，时间单位为ms} time 
 */
const hostsError = function (message, time) {
	// 显示提示信息
	dialog.showMessageBox({
		message: message,
		type: "error",
	});
	// 延迟强制关闭；
	setTimeout(() => {
		mainWindow.destroy();
	}, time);
}

/**
 * 在edge中想要执行C#代码 
 * 
 * 其中需要注意在代码中注释部分，不是真的注释，而是因为嵌入 C# 需要用到
 */
const findUSB = edge.func(function () {/*
	using System.IO;
	using System.Management;
	async (input) => {
		DriveInfo[] allDrives = DriveInfo.GetDrives();
		foreach (DriveInfo d in allDrives) {
			if (d.DriveType == DriveType.Removable) {
				if(d.Name[0] != 'A' && d.Name[0] != 'B') {
					return d.Name;
				}
			}
		}
		return "0";
	}
*/});

/**
 * 发现U盘后处理方法
 * @param {错误信息} error 
 * @param {USB 接口消息} result 
 */
const findUHandle = function (error, result) {
	if (error) throw error;
	// 判断是否是U盘
	if (result !== "0") {
		// 作弊标记
		isCheat = true;
		// 发送消息给渲染进程进行 ip 锁定
		mainWindow.webContents.send('lc-active', "lockIP");
		// 显示提示信息
		mainWindow.loadFile("./error/error_u.html");
		// 取消窗口信息的钩子
		mainWindow.unhookWindowMessage(0x0219);
	}
}

/**
 * 初始化窗口
 */
const initWindow = function () {
	// 隐藏菜单栏
	Menu.setApplicationMenu(null);
	// 创建BrowserWindow的实例 赋值给win打开窗口
	// 软件打开的的宽度和高度
	mainWindow = new BrowserWindow({
		icon: path.join(__dirname, './icon/favicon.ico'),			// 窗口图标
		show: false,				// 初始化隐藏
		webPreferences: {
			webviewTag: true,		// 必须为 true 才能启用vebview
			nodeIntegration: true,	// 启动 node 环境
			preload: path.join(__dirname, 'index.js')
		}
	});
	mainWindow.maximize();	// 最大化窗口
	mainWindow.show();		// 显示窗口
	mainWindow.loadFile('index.html'); // 把index.html加载到窗口里面
	// 打开窗口时开启调试模式    
	// mainWindow.webContents.openDevTools();
	// 发送消息到渲染进程获取本地 ip
	mainWindow.webContents.send('lc-active', "getIP");
	// 禁止用户关闭
	mainWindow.on('close', function (event) {
		// 显示提示信息
		dialog.showMessageBox({
			message: "请不要关闭考试软件，否则将影响考试，后果需要学生自己承担!",
			type: "error",
		});
		event.preventDefault();
	})
}
