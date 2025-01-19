#!/usr/bin/env node

const { execSync } = require("child_process");
const path = require("path");

const codemod = async () => {
  const args = process.argv.slice(2);
  const transformPath = path.join(__dirname, "transform.js");
  const command = `jscodeshift -t ${transformPath} ${args.join(" ")}`;

  try {
    execSync(command, { stdio: "inherit" });
  } catch (error: any) {
    console.error("Error running codemod:", error.message);
    process.exit(1);
  }
};

codemod();
