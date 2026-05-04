import { join } from "node:path";
import { hostname } from "node:os";
import { createServer } from "node:http";
import express from "express";
import wisp from "wisp-server-node";

import { uvPath } from "@titaniumnetwork-dev/ultraviolet";
import { epoxyPath } from "@mercuryworkshop/epoxy-transport";
import { baremuxPath } from "@mercuryworkshop/bare-mux/node";

const app = express();

// 1. הדלת הסודית - הנתיב שנותן לך את ההרשאה (העוגייה)
app.get('/workspace-login', (req, res) => {
    // שותל עוגייה סודית בדפדפן שתקפה לשנה שלמה
    res.setHeader('Set-Cookie', 'auth_token=granted; Path=/; Max-Age=31536000');
    // מעביר אותך מיד לדף הבית האמיתי
    res.redirect('/');
});

// 2. הגנת ההסוואה - תופס כל מי שמנסה להיכנס לדף הראשי
app.get('/', (req, res, next) => {
    const cookies = req.headers.cookie || '';
    
    // בודק אם לדפדפן יש את העוגייה שלנו
    if (!cookies.includes('auth_token=granted')) {
        // מי שאין לו את העוגייה יקבל רק את דף ההסוואה
        return res.send(`
            <!DOCTYPE html>
            <html dir="rtl">
            <head>
                <meta charset="UTF-8">
                <title>מערכת ניהול אזורית</title>
                <style>
                    body { font-family: sans-serif; text-align: center; margin-top: 15%; color: #333; }
                </style>
            </head>
            <body>
                <h1>גישה למורשים בלבד</h1>
                <p>אנא פנה למנהל הרשת לקבלת הרשאות מתאימות.</p>
            </body>
            </html>
        `);
    }
    
    // אם יש את העוגייה - הבקשה עוברת הלאה לקבצים של המערכת
    next();
});

// 3. טעינת הקבצים המקוריים בדיוק כפי שהם - בלי לשבור נתיבים
app.use(express.static("./public"));
app.use("/uv/", express.static(uvPath));
app.use("/epoxy/", express.static(epoxyPath));
app.use("/baremux/", express.static(baremuxPath));

// טיפול בשגיאות 
app.use((req, res) => {
    res.status(404).send("404 - Not Found");
});

const server = createServer();

server.on("request", (req, res) => {
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
    app(req, res);
});

server.on("upgrade", (req, socket, head) => {
    if (req.url.endsWith("/wisp/")) {
        wisp.routeRequest(req, socket, head);
        return;
    } 
    socket.end();
});

let port = parseInt(process.env.PORT || "");

if (isNaN(port)) port = 8080;

server.on("listening", () => {
    const address = server.address();
    console.log("Listening on:");
    console.log(`\thttp://localhost:${address.port}`);
    console.log(`\thttp://${hostname()}:${address.port}`);
    console.log(
        `\thttp://${
            address.family === "IPv6" ? `[${address.address}]` : address.address
        }:${address.port}`
    );
});

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

function shutdown() {
    console.log("SIGTERM signal received: closing HTTP server");
    server.close();
    process.exit(0);
}

server.listen({
    port,
});
