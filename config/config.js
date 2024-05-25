const path = require("path");
const configFilePath = path.join(
  `${process.env[process.platform === "darwin" ? "HOME" : "USERPROFILE"]}`,
  "/.jdhrc"
);
const buildConfig = {
    commitMsg: ''
}

const defaultConfig = {
  mode: "git",
  username: "",
  password: "",
  remoteUrl: "", // http://172.24.141.176:8357/git/yetu_web.git
  'rules:development:remoteBranchName': 'devtest',
  'rules:development:reg': '',
  'rules:test:remoteBranchName': 'test',
  'rules:test:reg': '',
  'rules:production:remoteBranchName': 'master',
  'rules:production:reg': '',
};
module.exports = {
  configFilePath,
  defaultConfig,
};
