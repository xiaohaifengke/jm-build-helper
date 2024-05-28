const execa = require("execa");
const inquirer = require("inquirer");
const ora = require("ora");
const path = require("path");
const fs = require("fs").promises;
const { projectWorkspacePath } = require("../config/config");
const { cleanDirectoryExcept, copyDirectory } = require("../utils");

async function deploy({
  username,
  password,
  remoteUrl,
  remoteBranchName,
  commitMsg = "temp",
}) {
  const projectPath = process.cwd();
  const projectDistDir = path.join(projectPath, "dist");
  const gitWorkspace = path.join(projectWorkspacePath, "temp-cd");
  const gitCredentialPath = path.join(projectWorkspacePath, ".git-credential");
  // https://gitee.com/manongjianghu/jm-material.git

  const gitCredentialStr = remoteUrl.replace(
    /(?<=https?:\/\/)\b/,
    `${username}:${password}@`
  );
  console.log("projectWorkspacePath: ", projectWorkspacePath);
  console.log("gitWorkspace: ", gitWorkspace);
  console.log("gitCredentialStr: ", gitCredentialStr);
  console.log("gitCredentialPath: ", gitCredentialPath);
  const spinner = ora({
    text: "正在部署...",
  }).start();

  try {
    await execaWrapper("rm", ["-rf", "temp-cd"], { cwd: projectWorkspacePath });
    await execaWrapper("mkdir", ["temp-cd"], { cwd: projectWorkspacePath });
    await ensureGitCredential({
      filePath: gitCredentialPath,
      content: gitCredentialStr,
    });
    await execaWrapper("git", ["init"], { cwd: gitWorkspace });
    await execaWrapper(
      "git",
      ["config", "credential.helper", "store", `--file=${gitCredentialPath}`],
      {
        cwd: gitWorkspace,
      }
    );
    await execaWrapper("git", ["remote", "add", "origin", remoteUrl], {
      cwd: gitWorkspace,
    });
    await execaWrapper("git", ["fetch"], { cwd: gitWorkspace });
    await execaWrapper(
      "git",
      ["checkout", "-B", remoteBranchName, `origin/${remoteBranchName}`],
      { cwd: gitWorkspace }
    );
    // await execa.command(
    //   `find . -mindepth 1 ! -path './.git*' -exec rm -rf {} +`,
    //   { cwd: gitWorkspace, shell: true }
    // );
    await cleanDirectoryExcept(gitWorkspace, [".git", ".gitignore"]);
    // await execaWrapper("cp", [ '-r', `${projectDistDir}/.`, '.'], { cwd: gitWorkspace });
    await copyDirectory(projectDistDir, gitWorkspace, ["**.DS_Store"]);
    await execaWrapper("git", ["status"], { cwd: gitWorkspace });
    await execaWrapper("git", ["add", "."], { cwd: gitWorkspace });
    await execaWrapper("git", ["commit", "-m", commitMsg], {
      cwd: gitWorkspace,
    });
    await execaWrapper("git", ["push"], { cwd: gitWorkspace });

    spinner.succeed("部署成功");
  } catch (e) {
    console.log("部署失败: ", e);
    spinner.fail("部署失败");
  }
  console.log("------------- end -------------");

  async function execaWrapper(...args) {
    const { stdout, stderr } = await execa(...args);
    // 输出命令的 stdout 和 stderr
    if (stdout) {
      console.log("Command stdout:", stdout);
    }
    if (stderr) {
      // spinner.fail("部署失败");
      console.error("Command stderr:", stderr);
    }
  }
}

async function inquireDeployConfig() {
  const { commitMsg } = await inquirer.prompt([
    {
      type: "input",
      name: "commitMsg",
      message: `请输入本次部署的描述信息`,
      default: "temp",
    },
  ]);
  return {
    commitMsg,
  };
}

async function ensureGitCredential({ filePath, content }) {
  try {
    // 检查 .git-credential 文件是否存在
    try {
      await fs.access(filePath);
    } catch (error) {
      // 文件不存在，创建文件并写入内容
      await fs.writeFile(filePath, content, "utf8");
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
}

module.exports = {
  deploy,
  inquireDeployConfig,
};
