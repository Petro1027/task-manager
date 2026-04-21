import dotenv from "dotenv";
import app from "./app";

dotenv.config();

const port = Number(process.env.PORT) || 3001;

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
