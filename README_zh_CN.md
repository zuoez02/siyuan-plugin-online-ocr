# 在线图片文字识别(Online OCR)

> 此版本为先行预览版

## 功能

1. 请在Azure(国内版或国际版均可)创建 ComputerVision资源，目前试用版免费，每分钟可请求20次
2. 将终结点和密钥复制到插件的设置中（点击Dock右上角的设置按钮即可打开设置配置页面）并保存
3. 右键点击图片，选择插件->执行在线图片文字识别
4. 右侧Dock中可以看到已经开始调度的任务
5. 当任务结束后，名称右侧会有对号（成功），❌（失败）
6. 成功的任务，图片下面会出现打开详情、复制全部和删除按钮
7. 点击打开详情，可以看到图片中OCR成功识别的文字内容和位置，点击出现菜单查看识别出的结果，点击内容复制识别结果
8. 点击任务的名称可以打开图片所在块文档

### Azure API

需要配置Azure的终端地址及Azure密钥,[官方文档](https://learn.microsoft.com/zh-CN/azure/ai-services/computer-vision/quickstarts-sdk/client-library)

### Baidu API

需要配置百度AI平台的OCR功能,[官方文档](https://console.bce.baidu.com/ai/?_=1707048185420&fromai=1#/ai/ocr/overview/index)

## Changelog

+ v0.2.0: 支持百度API

+ v0.1.0: 支持Azure API