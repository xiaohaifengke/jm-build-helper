const execa = require("execa");

async function deploy({
  username,
  password,
  remoteUrl,
  remoteBranchName,
  commitMsg = "temp",
}) {
  const spinner = ora({
    text: "正在部署...",
  }).start();
  try {
    await execa("ls");
    await execa.command("rm -rf temp-cd");
    await execa.command("mkdir temp-cd");
    await execa.command(
      `echo "http://${username}:${password}@172.24.141.176:8357/git/yetu_web.git" > \.git-credential`
    );
    await execa("cd temp-cd");
    await execa("git init");
    await execa("git config credential.helper store --file=.git-credential");
    await execa("git remote add origin", [remoteUrl]);
    await execa("git pull");
    await execa("git checkout", [remoteBranchName]);
    await execa(
      `find . ! -path './.git*' ! -name '.' ! -name '..' -exec rm -rf {} +`
    );
    await execa("ls");
    await execa("cp -r ../dist/. .");
    await execa("git add .");
    await execa("git commit -m", [commitMsg]);
    await execa("git push");

    spinner.succeed("部署成功");
  } catch (e) {
    console.log("部署失败: ", e);
    spinner.fail("正在部署...");
  }
}

module.exports = {
  deploy,
};
