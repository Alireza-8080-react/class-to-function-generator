#!/usr/bin/env node

const { execSync } = require("child_process");

const codemod = async () => {
  const args = process.argv.slice(2);

  const command = `jscodeshift -t ./transform.js ${args.join(" ")}`;

  try {
    execSync(command, { stdio: "inherit" });
  } catch (error: any) {
    console.error("Error running codemod:", error.message);
    process.exit(1);
  }
};

codemod();
