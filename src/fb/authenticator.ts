import https from "https";
import cookie from "cookie";
import queryString from "querystring";
import { IncomingMessage } from "http";
import { writeFile, readdirSync } from "fs";

interface Cookie {
  c_user: string;
  xs: string;
}

export class FbAuthenticator {
  private saveCookiesInMemory(cookies: Cookie): void {
    writeFile(
      "user_cookie.json",
      JSON.stringify(cookies),
      { encoding: "utf-8" },
      (err) => {
        if (err)
          throw new Error(
            "Um erro ocorreu ao tentar salvar o arquivo de cookie, execute a aplicação novamente"
          );
      }
    );
  }

  public getCookies(email: string, password: string, callback: Function): void {
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

    function getSensitiveCookie(cookieStr: string): Cookie {
      const sensitiveCookie = cookie.parse(cookieStr);
      const [c_user, xs] = [
        sensitiveCookie["httponly,c_user"],
        sensitiveCookie["secure,xs"],
      ];
      return { c_user, xs };
    }

    const req = https.request(fbGetCookieOptions, (res: IncomingMessage) => {
      const cookies = res.headers["set-cookie"].toString();
      try {
        const userCookies: Cookie = getSensitiveCookie(cookies);
        this.saveCookiesInMemory(userCookies);
      } catch (error) {
        throw new Error(
          "Um erro ocorreu ao tentar obter seus cookies, por favor tente novamente"
        );
      }
    });

    req.write(data);
    req.end();
  }

  public get hasCookieStored(): boolean {
    return readdirSync(__dirname).includes("cookies.json");
  }
}
