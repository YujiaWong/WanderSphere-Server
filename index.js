import express from "express";
import UsersRouter from "./routes/users.js";
import AuthRouter from "./routes/auth.js";
import likesRouter from "./routes/likes.js";
import postsRouter from "./routes/posts.js";
import commentsRouter from "./routes/comments.js";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", true);
  next();
});
app.use(express.json()); //用来解析JSON格式的请求体
app.use(
  cors({
    origin: "http://localhost:3000",
  })
);
app.use(cookieParser()); //一个 Node.js 中间件，专门用来解析 HTTP 请求中的 Cookie 字符串，并将其转换为易于操作的 JavaScript 对象。

app.use("/api/users", UsersRouter); //挂载路由中间件，一旦url前面部分是api/users，就会引导进入usersRouter路由组件下的路由，然后在这个内部组件再找寻对应url尾巴
app.use("/api/auth", AuthRouter);
app.use("/api/comments", commentsRouter);
app.use("/api/posts", postsRouter);
app.use("/api/likes", likesRouter);

app.listen(4000, () => {
  console.log("创建服务器成功,端口4000");
});
