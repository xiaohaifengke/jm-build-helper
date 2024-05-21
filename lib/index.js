const path = require("path");
const fs = require("fs-extra");
const chalk = require("chalk");
const config = require("../config/index").get();
const { spawn } = require("child_process");
const deploy = require("./deploy");
/**
 * 1. 读取ini config，获取当前执行目录对应的配置
 * 2. 配置支持设置不同分支的部署环境
 * @param {*} options
 */
module.exports = async function (options) {
  console.log(options, config);
  // TODO: 配置项检查校验
  // 部署脚本
  deploy();
};
