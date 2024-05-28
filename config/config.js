const fs = require('fs-extra');
const path = require("path");
const userHomeDirectory = `${
  process.env[process.platform === "darwin" ? "HOME" : "USERPROFILE"]
}`;
const helperDirectoryPath = path.join(userHomeDirectory, ".jm-deploy-helper");
(async () => {
    try {
        await fs.ensureDir(helperDirectoryPath);
    } catch (err) {
        console.error(`无法确保目录存在: ${err}`);
    }
})();
const currentDirectoryPath = process.cwd();
const currentDirectoryName = path.basename(currentDirectoryPath);
const configFilePath = path.join(helperDirectoryPath, currentDirectoryName);

const buildConfig = {
  commitMsg: "",
};

const defaultConfig = {
  mode: "git",
  username: "",
  password: "",
  remoteUrl: "",
  "rules:development:remoteBranchName": "devtest",
  "rules:development:reg":
    "^((feature|refactor|fix)/.+|master|develop|dev|release)$",
  "rules:test:remoteBranchName": "test",
  "rules:test:reg": "^release$",
  "rules:production:remoteBranchName": "master",
  "rules:production:reg": "^master$",
  receiver: "",
};
module.exports = {
  configFilePath,
  defaultConfig,
};
