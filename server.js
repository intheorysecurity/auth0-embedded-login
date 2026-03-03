const dotenv = require("dotenv");

dotenv.config();

const { createApp } = require("./app");

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
const app = createApp();

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

