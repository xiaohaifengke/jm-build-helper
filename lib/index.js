const path = require("path");
const fs = require("fs-extra");
const chalk = require("chalk");
const config = require("../config/index").get();
const { spawn } = require("child_process");
const { deploy, inquireDeployConfig } = require("./deploy");
const { getCurrentGitBranch } = require("../utils");
/**
 * 1. 读取ini config，获取当前执行目录对应的配置
 * 2. 配置支持设置不同分支的部署环境
 * @param {*} options
 */
module.exports = async function (options) {
  const deployConfig = await inquireDeployConfig();
  // TODO: 配置项检查校验
  // 部署脚本
  const currentGitBranch = getCurrentGitBranch();
  const envs = ["production", "test", "development"];
  for (const env of envs) {
    const envRuleBranchName = config[`rules:${env}:remoteBranchName`];
    const envRuleBranchRegStr = config[`rules:${env}:reg`];
    const reg = new RegExp(envRuleBranchRegStr)
    if (reg.test(currentGitBranch)) {
      await deploy({
        username: config.username,
        password: config.password,
        remoteUrl: config.remoteUrl,
        remoteBranchName: envRuleBranchName,
        commitMsg: deployConfig.commitMsg,
        env,
        webhookUrl: config[`rules:${env}:webhookUrl`],
        atMobiles: config[`rules:${env}:atMobiles`]
      });
    }
  }
};
