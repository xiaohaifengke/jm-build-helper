const inquirer = require("inquirer");
const { get, set, remove } = require("./index");

async function guide() {
  const { mode } = await inquirer.prompt([
    {
      type: "list",
      name: "mode",
      message: `选择部署方式`,
      choices: [
        { name: "git", value: "git" },
        { name: "钉钉", value: "dingding" },
      ],
    },
  ]);
  console.log("mode: ", mode);
  let result;
  if (mode === "git") {
    result = await guideGitConfig();
  } else {
    result = await guideDingdingConfig();
  }
  console.log("result", result);
}

async function guideGitConfig() {
  const { username } = await inquirer.prompt([
    {
      type: "input",
      name: "username",
      message: `请输入部署仓库的克隆用户名`,
    },
  ]);
  const { password } = await inquirer.prompt([
    {
      type: "input",
      name: "password",
      message: `请输入部署仓库的克隆密码`,
    },
  ]);
  const { remoteUrl } = await inquirer.prompt([
    {
      type: "input",
      name: "remoteUrl",
      message: `请输入部署仓库的克隆地址`,
    },
  ]);
  const { devBranchName } = await inquirer.prompt([
    {
      type: "input",
      name: "devBranchName",
      message: `【开发环境】请输入部署仓库的分支名`,
      default: "devtest",
    },
  ]);
  const { devMatchRule } = await inquirer.prompt([
    {
      type: "input",
      name: "devMatchRule",
      message: `【开发环境】请输入匹配正则（用于匹配代码仓库中哪些分支名是需要部署到该环境的）`,
      default: "^((feature|refactor|fix)/.+|master|develop|dev|release)$",
    },
  ]);
  const { testBranchName } = await inquirer.prompt([
    {
      type: "input",
      name: "testBranchName",
      message: `【测试环境】请输入部署仓库的分支名`,
      default: "test",
    },
  ]);
  const { testMatchRule } = await inquirer.prompt([
    {
      type: "input",
      name: "testMatchRule",
      message: `【测试环境】请输入匹配正则（用于匹配代码仓库中哪些分支名是需要部署到该环境的）`,
      default: "^release$",
    },
  ]);
  const { prodBranchName } = await inquirer.prompt([
    {
      type: "input",
      name: "prodBranchName",
      message: `【生产环境】请输入部署仓库的分支名`,
      default: "master",
    },
  ]);
  const { prodMatchRule } = await inquirer.prompt([
    {
      type: "input",
      name: "prodMatchRule",
      message: `【生产环境】请输入匹配正则（用于匹配代码仓库中哪些分支名是需要部署到该环境的）`,
      default: "^master$",
    },
  ]);

  return {
    username,
    password,
    remoteUrl,
    "rules:development:remoteBranchName": devBranchName,
    "rules:development:reg": devMatchRule,
    "rules:test:remoteBranchName": testBranchName,
    "rules:test:reg": testMatchRule,
    "rules:production:remoteBranchName": prodBranchName,
    "rules:production:reg": prodMatchRule,
  };
}

async function guideDingdingConfig() {
  const { receiver } = await inquirer.prompt([
    {
      type: "input",
      name: "receiver",
      message: `请输入接受者的手机号`,
    },
  ]);
  return { receiver };
}

module.exports = {
  guide,
};
