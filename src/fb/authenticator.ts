import https from "https";
import cookie from "cookie";
import queryString from "querystring";
import { IncomingMessage } from "http";

interface Cookie {
  c_user: string;
  xs: string;
}

function login(cookies: Cookie): void {
  console.log(cookies);
}

function getCookies(email: string, password: string, callback: Function): void {
  const data = queryString.stringify({
    email: email,
    pass: password,
    default_persistent: "1",
    timezone: "-120",
  });

  const cookiesHeaders = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36",
    Cookie: "_js_reg_fb_gate=null",
    Host: "www.facebook.com",
    "Content-Type": "application/x-www-form-urlencoded",
    "Content-Length": Buffer.byteLength(data),
  };

  const fbGetCookieOptions = {
    protocol: "https:",
    hostname: "www.facebook.com",
    path: "/login.php?login_attempt=1&lwv=110",
    method: "POST",
    headers: cookiesHeaders,
  };

  function getSensitiveCookie(cookieStr: string): void {
    const sensitiveCookie = cookie.parse(cookieStr);
    const [c_user, xs] = [
      sensitiveCookie["httponly,c_user"],
      sensitiveCookie["secure,xs"],
    ];
    callback(<Cookie>{ c_user, xs });
  }

  const req = https.request(fbGetCookieOptions, (res: IncomingMessage) => {
    const cookies = res.headers["set-cookie"].toString();
    callback(getSensitiveCookie(cookies));
  });

  req.write(data);
  req.end();
}

getCookies("your_fb_email", "your_fb_password", login);
