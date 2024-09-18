const execa = require("execa");
const inquirer = require("inquirer");
const ora = require("ora");
const path = require("path");
const fs = require("fs").promises;
const { projectWorkspacePath, projectName } = require("../config/config");
const {
  cleanDirectoryExcept,
  copyDirectory,
  sendDingTalkMarkdown,
  logCommand,
} = require("../utils");
const config = require("../config/index").get();

async function deploy({
  distPath,
  username,
  password,
  remoteUrl,
  remoteBranchName,
  env,
  webhookUrl,
  atMobiles,
  commitMsg,
  announcement,
}) {
  const projectPath = process.cwd();
  const projectDistDir = path.join(projectPath, distPath);
  const gitWorkspace = path.join(projectWorkspacePath, "git-workspace");
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

  await ensureGitCredential({
    filePath: gitCredentialPath,
    content: gitCredentialStr,
  });
  try {
    const statusRes = await execaWrapper("git", ["status"], {
      cwd: gitWorkspace,
    });
  } catch (error) {
    // 失败时重新初始化
    await execaWrapper("rm", ["-rf", "git-workspace"], {
      cwd: projectWorkspacePath,
    });
    await execaWrapper("mkdir", ["git-workspace"], {
      cwd: projectWorkspacePath,
    });
    await execaWrapper("git", ["init"], { cwd: gitWorkspace });
    await execaWrapper(
      "git",
      ["config", "credential.helper", "store", `--file=../.git-credential`],
      {
        cwd: gitWorkspace,
      }
    );
    await execaWrapper("git", ["remote", "add", "origin", remoteUrl], {
      cwd: gitWorkspace,
    });
    // await execaWrapper("git", ["fetch"], { cwd: gitWorkspace });
  }

  try {
    // const {
    //   groups: { curBranch },
    // } = statusRes.match(/On branch (?<curBranch>[^\s]+)/);
    // console.log(`当前的分支为： ${curBranch}`);

    // await execaWrapper("rm", ["-rf", "git-workspace"], { cwd: projectWorkspacePath });
    // await execaWrapper("mkdir", ["git-workspace"], { cwd: projectWorkspacePath });
    // await execaWrapper("git", ["init"], { cwd: gitWorkspace });
    // await execaWrapper(
    //   "git",
    //   ["config", "credential.helper", "store", `--file=../.git-credential`],
    //   {
    //     cwd: gitWorkspace,
    //   }
    // );
    // await execaWrapper("git", ["remote", "add", "origin", remoteUrl], {
    //   cwd: gitWorkspace,
    // });
    await execaWrapper("git", ["fetch"], { cwd: gitWorkspace });
    await execaWrapper(
      "git",
      ["checkout", "-B", remoteBranchName, `origin/${remoteBranchName}`],
      { cwd: gitWorkspace }
    );
    await execaWrapper("git", ["pull"], { cwd: gitWorkspace });

    // await execa.command(
    //   `find . -mindepth 1 ! -path './.git*' -exec rm -rf {} +`,
    //   { cwd: gitWorkspace, shell: true }
    // );
    await cleanDirectoryExcept(gitWorkspace, [".git", ".gitignore"]);
    const files2 = await fs.readdir(gitWorkspace, { withFileTypes: true });
    console.log("files2", files2);
    // await execaWrapper("cp", [ '-r', `${projectDistDir}/.`, '.'], { cwd: gitWorkspace });
    await copyDirectory(projectDistDir, gitWorkspace, ["**.DS_Store"]);
    await execaWrapper("git", ["status"], { cwd: gitWorkspace });
    await execaWrapper("git", ["add", "."], { cwd: gitWorkspace });
    await execaWrapper("git", ["commit", "-m", commitMsg], {
      cwd: gitWorkspace,
    });
    await execaWrapper("git", ["push"], { cwd: gitWorkspace });

    spinner.succeed("部署成功");
    if (announcement) {
      sendDingTalkMarkdown({
        webhookUrl,
        atMobiles,
        succeed: true,
        projectName,
        env,
        username,
        commitMsg,
      });
    }
  } catch (e) {
    console.log("部署失败: ", e);
    spinner.fail("部署失败");
    if (announcement) {
      sendDingTalkMarkdown({
        webhookUrl: config.failedWebhook,
        atMobiles: config.failedAtMobiles,
        succeed: false,
        failedReason: e.toString?.(),
        projectName,
        env,
        username,
      });
    }
  }
  console.log("------------- end -------------");

  async function execaWrapper(...args) {
    logCommand(args);
    try {
      const subprocess = execa(...args);
      subprocess.stdout.pipe(process.stdout);
      const { stdout } = await subprocess;
      // console.log(stdout);
    } catch (error) {
      console.error(args, error);
      throw error;
    }

    // const { stdout, stderr, ...rest } = await execa(...args);
    // // 输出命令的 stdout 和 stderr
    // if (stdout) {
    //   console.log("Command stdout:", stdout);
    //   return Promise.resolve(stdout);
    // }
    // if (stderr) {
    //   // spinner.fail("部署失败");
    //   console.error("Command stderr:", stderr);
    //   return Promise.resolve(stderr);
    // }
    // console.log("rest: ", rest);
  }
}

async function inquireDeployConfig() {
  const { commitMsg, announcement } = await inquirer.prompt([
    {
      type: "input",
      name: "commitMsg",
      message: `请输入本次部署的描述信息`,
      default: "chore: some chores",
    },
    {
      type: "confirm",
      name: "announcement",
      message: `是否通知本次部署的信息`,
      default: true,
    },
  ]);
  return {
    commitMsg,
    announcement,
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
