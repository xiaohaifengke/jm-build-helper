const inquirer = require("inquirer");
const { get, set, remove } = require("./index");

async function guide() {
  const config = get();
  const { mode } = await inquirer.prompt([
    {
      type: "list",
      name: "mode",
      message: `选择部署方式`,
      choices: [
        { name: "git", value: "git" },
        { name: "钉钉", value: "dingding" },
      ],
      default: config.mode,
    },
  ]);
  let result;
  if (mode === "git") {
    result = await guideGitConfig();
  } else {
    result = await guideDingdingConfig();
  }
  return result
}

async function guideGitConfig() {
  const config = get();
  const { distPath } = await inquirer.prompt([
    {
      type: "input",
      name: "distPath",
      message: `请输入构建输出目录的相对路径`,
      default: config.distPath,
    },
  ]);
  const { username } = await inquirer.prompt([
    {
      type: "input",
      name: "username",
      message: `请输入部署仓库的克隆用户名`,
      default: config.username,
    },
  ]);
  const { password } = await inquirer.prompt([
    {
      type: "input",
      name: "password",
      message: `请输入部署仓库的克隆密码`,
      default: config.password,
    },
  ]);
  const { remoteUrl } = await inquirer.prompt([
    {
      type: "input",
      name: "remoteUrl",
      message: `请输入部署仓库的克隆地址`,
      default: config.remoteUrl,
    },
  ]);
  const { devBranchName } = await inquirer.prompt([
    {
      type: "input",
      name: "devBranchName",
      message: `【开发环境】请输入部署仓库的分支名`,
      default: config["rules:development:remoteBranchName"],
    },
  ]);
  const { devMatchRule } = await inquirer.prompt([
    {
      type: "input",
      name: "devMatchRule",
      message: `【开发环境】请输入匹配正则（用于匹配代码仓库中哪些分支名是需要部署到该环境的）`,
      default: config["rules:development:reg"],
    },
  ]);
  const { devWebhook } = await inquirer.prompt([
    {
      type: "input",
      name: "devWebhook",
      message: `【开发环境】请输入钉钉通知的webhook`,
      default: config["rules:development:webhookUrl"] || '',
    },
  ]);
  const { devAtMobiles } = await inquirer.prompt([
    {
      type: "input",
      name: "devAtMobiles",
      message: `【开发环境】请输入钉钉通知人员的手机号`,
      default: config["rules:development:atMobiles"] || '',
    },
  ]);
  const { testBranchName } = await inquirer.prompt([
    {
      type: "input",
      name: "testBranchName",
      message: `【测试环境】请输入部署仓库的分支名`,
      default: config["rules:test:remoteBranchName"],
    },
  ]);
  const { testMatchRule } = await inquirer.prompt([
    {
      type: "input",
      name: "testMatchRule",
      message: `【测试环境】请输入匹配正则（用于匹配代码仓库中哪些分支名是需要部署到该环境的）`,
      default: config["rules:test:reg"],
    },
  ]);
  const { testWebhook } = await inquirer.prompt([
    {
      type: "input",
      name: "testWebhook",
      message: `【测试环境】请输入钉钉通知的webhook`,
      default: config["rules:development:webhookUrl"] || '',
    },
  ]);
  const { testAtMobiles } = await inquirer.prompt([
    {
      type: "input",
      name: "testAtMobiles",
      message: `【测试环境】请输入钉钉通知人员的手机号`,
      default: config["rules:development:atMobiles"] || '',
    },
  ]);
  const { prodBranchName } = await inquirer.prompt([
    {
      type: "input",
      name: "prodBranchName",
      message: `【生产环境】请输入部署仓库的分支名`,
      default: config["rules:production:remoteBranchName"],
    },
  ]);
  const { prodMatchRule } = await inquirer.prompt([
    {
      type: "input",
      name: "prodMatchRule",
      message: `【生产环境】请输入匹配正则（用于匹配代码仓库中哪些分支名是需要部署到该环境的）`,
      default: config["rules:production:reg"],
    },
  ]);
  const { prodWebhook } = await inquirer.prompt([
    {
      type: "input",
      name: "prodWebhook",
      message: `【生产环境】请输入钉钉通知的webhook`,
      default: config["rules:development:webhookUrl"] || '',
    },
  ]);
  const { prodAtMobiles } = await inquirer.prompt([
    {
      type: "input",
      name: "prodAtMobiles",
      message: `【生产环境】请输入钉钉通知人员的手机号`,
      default: config["rules:development:atMobiles"] || '',
    },
  ]);
  const { failedWebhook } = await inquirer.prompt([
    {
      type: "input",
      name: "failedWebhook",
      message: `请输入当部署失败时钉钉通知的webhook`,
      default: config["rules:development:webhookUrl"] || "",
    },
  ]);
  const { failedAtMobiles } = await inquirer.prompt([
    {
      type: "input",
      name: "failedAtMobiles",
      message: `【请输入当部署失败时钉钉通知人员的手机号`,
      default: config["rules:development:atMobiles"] || "",
    },
  ]);

  return {
    distPath,
    username,
    password,
    remoteUrl,
    "rules:development:remoteBranchName": devBranchName,
    "rules:development:reg": devMatchRule,
    "rules:development:webhookUrl": devWebhook,
    "rules:development:atMobiles": devAtMobiles,
    "rules:test:remoteBranchName": testBranchName,
    "rules:test:reg": testMatchRule,
    "rules:test:webhookUrl": testWebhook,
    "rules:test:atMobiles": testAtMobiles,
    "rules:production:remoteBranchName": prodBranchName,
    "rules:production:reg": prodMatchRule,
    "rules:production:webhookUrl": prodWebhook,
    "rules:production:atMobiles": prodAtMobiles,
    failedWebhook: failedWebhook,
    failedAtMobiles: failedAtMobiles,
  };
}

async function guideDingdingConfig() {
  const config = get();
  const { receiver } = await inquirer.prompt([
    {
      type: "input",
      name: "receiver",
      message: `请输入接受者的手机号`,
      default: config.receiver,
    },
  ]);
  return { receiver };
}

module.exports = {
  guide,
};
