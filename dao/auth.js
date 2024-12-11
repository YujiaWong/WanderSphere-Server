import { db } from "../connect.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = (req, res) => {
  //是否已存在用户
  const q = "SELECT * FROM users WHERE username = ?";
  db.query(q, [req.body.username], (err, data) => {
    if (err) {
      return res.status(500).json(err);
    }
    if (data.length) {
      return res.status(409).json("User already exists!");
    }
    //不存在，密码加密后注册用户存入数据库
    const salt = bcrypt.genSaltSync(10); //生成盐度表示加密复杂度
    const hashedPassword = bcrypt.hashSync(req.body.password, salt); //结合盐度来加密生成hash密码
    const q =
      "INSERT INTO users(`username`,`email`,`password`,`name`) VALUES (?)";
    const values = [
      req.body.username,
      req.body.email,
      hashedPassword,
      req.body.name,
    ];
    db.query(q, [values], (err, data) => {
      if (err) {
        return res.status(500).json(err);
      }
      if (data) {
        return res.status(200).json("Register successfully");
      }
    });
  });
};
export const login = (req, res) => {
  const q = "SELECT * FROM users WHERE username = ?";
  db.query(q, [req.body.username], (err, data) => {
    //data是sql语句返回的对象数组
    if (err) {
      return res.status(500).json(err);
    }
    if (data.length === 0) {
      //如果data返回的对象数组没有东西，说明没找到账号
      return res.status(404).json("user not found");
    }
    //有对应的用户名，看密码能不能对上
    const checkPassword = bcrypt.compareSync(
      req.body.password,
      data[0].password
    ); //用于比较一个未加密的密码和一个已经加密的哈希密码，来验证它们是否匹配,匹配返true
    if (!checkPassword) {
      return res.status(400).json("Wrong password or username");
    }
    //密码也对上了，要令牌储存给浏览器维持登录状态
    const token = jwt.sign({ id: data[0].id }, "secretKey"); //创建jwt令牌，因为用户id是唯一的，用这个做令牌，区别删帖权限。后期加上管理员
    const { password, ...others } = data[0]; //others表示结构出的除password以外的其他值的集合体
    res
      .cookie("accessToken", token, { httpOnly: true }) //res.cookie() 是 Express 中用于设置响应中 Set-Cookie 头部的函数。它允许你在 HTTP 响应中发送一个 Cookie 到客户端，浏览器将接收到这个 Cookie 并在后续的请求中携带它。结构：cookie名称，携带的value，附加操作。一旦发给客户端后，后续验证请求请求头会自动携带含有token的cookie，无需再做代码逻辑
      .status(200)
      .json(others); //不要密码的其他数据返回
  });
};

export const logout = (req, res) => {
  //登出简单就是清除cookie就好了, 里面填写要清除的cookie的名字,secure表示此 cookie 仅通过 HTTPS 传输，增强安全性。samesite表示不同域名也ok，允许跨域去清除cookie
  res
    .clearCookie("accessToken", {
      secure: true,
      samesite: "none",
    })
    .status(200)
    .json("Log out successfully");
};
