module.exports = {
  apps: [
    {
      name: "food-crm-frontend-staging",
      script: "npm",
      args: "run start -- -p 3100",
      cwd: __dirname,
      env: {
        NODE_ENV: "production",
        PORT: "3100",
      },
      max_memory_restart: "768M",
    },
  ],
};
