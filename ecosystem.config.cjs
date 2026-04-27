module.exports = {
  apps: [
    {
      name: "food-crm-frontend",
      script: "npm",
      args: "run start -- -p 3000",
      cwd: __dirname,
      env: {
        NODE_ENV: "production",
        PORT: "3000",
      },
      max_memory_restart: "768M",
    },
  ],
};
