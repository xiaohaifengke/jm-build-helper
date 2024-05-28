const { execSync } = require("child_process");
const fs = require("fs").promises;
const path = require("path");
const { minimatch } = require("minimatch");

function getCurrentGitBranch() {
  try {
    const branchName = execSync("git rev-parse --abbrev-ref HEAD", {
      encoding: "utf8",
    }).trim();
    console.log(`当前分支名称是: ${branchName}`);
    return branchName;
  } catch (err) {
    console.error("执行 git 命令时出错:", err);
  }
}

/**
 * 清理目标文件夹，并可以指定任意要排除的目录或文件
 * @param {*} directory
 * @param {*} excludeList
 */
async function cleanDirectoryExcept(directory, excludeList, isTop) {
  const files = await fs.readdir(directory, { withFileTypes: true });
  for (const file of files) {
    const fullPath = path.join(directory, file.name);

    // 如果当前文件或目录在排除列表中，跳过
    if (excludeList.includes(file.name)) {
      continue;
    }

    if (file.isDirectory()) {
      // 递归删除子目录
      await cleanDirectoryExcept(fullPath, excludeList, true);
      // 删除空目录
      await fs.rmdir(fullPath);
    } else {
      // 删除文件
      await fs.unlink(fullPath);
    }
  }
  if (!isTop) {
    console.log(
      "Directory cleaned successfully, excluding specified files and directories."
    );
  }
}

/**
 * 模拟cp命令，并可以指定任意要排除的目录或文件
 * @param {*} source
 * @param {*} destination
 * @param {*} excludeList
 */
async function copyDirectory(source, destination, excludePatterns, isTop) {
  await fs.mkdir(destination, { recursive: true });
  const entries = await fs.readdir(source, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = path.join(source, entry.name);
    const destinationPath = path.join(destination, entry.name);

    // 如果当前文件或目录匹配排除列表中的任意模式，跳过
    if (
      excludePatterns.some((pattern) =>
        minimatch(entry.name, pattern, { dot: true })
      )
    ) {
      continue;
    }

    if (entry.isDirectory()) {
      // 递归复制子目录
      await copyDirectory(sourcePath, destinationPath, excludePatterns, true);
    } else {
      // 复制文件
      await fs.copyFile(sourcePath, destinationPath);
    }
  }
  if (!isTop) {
    console.log(
      `Copied directory from ${source} to ${destination} excluding specified patterns.`
    );
  }
}

module.exports = {
  getCurrentGitBranch,
  cleanDirectoryExcept,
  copyDirectory,
};