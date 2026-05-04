import { hostname } from "node:os";
import { createServer } from "node:http";
import { createHash } from "node:crypto";
import express from "express";
import wisp from "wisp-server-node";

import { uvPath } from "@titaniumnetwork-dev/ultraviolet";
import { epoxyPath } from "@mercuryworkshop/epoxy-transport";
import { baremuxPath } from "@mercuryworkshop/bare-mux/node";

const app = express();

// --- Time-based access token ---
// The gate path changes daily based on a hash of the current date.
// Example: /gate-a3f8b1 (changes every day)
function getGateHash() {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const secret = "regional-dashboard-2024";
    return createHash("sha256")
        .update(today + secret)
        .digest("hex")
        .slice(0, 6);
}

app.get('/gate-:token', (req, res) => {
    const expected = getGateHash();
    if (req.params.token === expected) {
        res.setHeader('Set-Cookie', 'sess_id=active; Path=/; Max-Age=31536000; HttpOnly');
        res.redirect('/');
    } else {
        res.status(404).send("Not Found");
    }
});

// Helper endpoint: returns today's gate path (access from localhost only for safety)
app.get('/debug/gate', (req, res) => {
    const remote = req.ip || req.connection.remoteAddress;
    if (remote === '127.0.0.1' || remote === '::1' || remote === '::ffff:127.0.0.1') {
        res.json({ gate: `/gate-${getGateHash()}` });
    } else {
        res.status(404).send("Not Found");
    }
});

// --- Decoy page: boring broken weather stats dashboard ---
app.get('/', (req, res, next) => {
    const cookies = req.headers.cookie || '';
    
    if (!cookies.includes('sess_id=active')) {
        return res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Regional Weather Statistics - Internal Tool</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f4f4f4; color: #333; margin: 0; padding: 20px; }
        .container { max-width: 800px; margin: 40px auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden; }
        .header { background: #2c5282; color: white; padding: 15px 25px; display: flex; align-items: center; gap: 10px; }
        .header h1 { margin: 0; font-size: 18px; font-weight: 500; }
        .status-bar { background: #e2e8f0; padding: 8px 25px; font-size: 12px; color: #718096; border-bottom: 1px solid #cbd5e0; }
        .content { padding: 25px; }
        .error-box { background: #fff5f5; border: 1px solid #fed7d7; border-radius: 6px; padding: 20px; margin: 15px 0; }
        .error-box h3 { color: #c53030; margin: 0 0 8px 0; font-size: 14px; }
        .error-box code { background: #fed7d7; padding: 2px 6px; border-radius: 3px; font-size: 12px; color: #742a2a; }
        .error-box p { margin: 8px 0 0 0; font-size: 13px; color: #718096; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { padding: 10px 15px; text-align: left; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
        th { background: #f7fafc; color: #4a5568; font-weight: 600; }
        td { color: #718096; }
        .footer { padding: 10px 25px; background: #f7fafc; border-top: 1px solid #e2e8f0; font-size: 11px; color: #a0aec0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/><circle cx="12" cy="12" r="4"/></svg>
            <h1>Regional Weather Statistics Portal</h1>
        </div>
        <div class="status-bar">Last sync: 2024-12-15 08:42:31 UTC &mdash; Station: IL-HAIFA-07 &mdash; Status: <span style="color:#c53030">&#9679;</span> Connection timeout</div>
        <div class="content">
            <div class="error-box">
                <h3>&#9888; Database Connection Failed</h3>
                <code>SQLSTATE[HY000] [2002] Connection refused (tcp://10.0.4.17:5432)</code>
                <p>The meteorological data aggregation service is currently unavailable. The operations team has been notified. Estimated recovery: 2-4 hours.</p>
            </div>
            <h4 style="color:#4a5568;font-size:14px;">Cached Summary (last successful sync)</h4>
            <table>
                <thead><tr><th>Station</th><th>Avg Temp</th><th>Humidity</th><th>Wind</th><th>Last Update</th></tr></thead>
                <tbody>
                    <tr><td>Haifa North</td><td>18.4°C</td><td>72%</td><td>14 km/h NW</td><td>Dec 14, 23:10</td></tr>
                    <tr><td>Haifa Port</td><td>19.1°C</td><td>78%</td><td>11 km/h W</td><td>Dec 14, 23:10</td></tr>
                    <tr><td>Carmel Peak</td><td>15.7°C</td><td>65%</td><td>22 km/h NW</td><td>Dec 14, 22:45</td></tr>
                    <tr><td>Krayot</td><td>17.9°C</td><td>74%</td><td>9 km/h SW</td><td>Dec 14, 23:10</td></tr>
                </tbody>
            </table>
        </div>
        <div class="footer">Internal use only &mdash; Weather Data Service v3.2.1 &mdash; Contact: sysadmin@regional-met.internal</div>
    </div>
</body>
</html>`);
    }
    
    next();
});

// --- Static files with obfuscated paths ---
app.use(express.static("./public"));

// File aliases for npm package assets (hide original filenames from network traffic)
app.get("/libs/core.js", (req, res) => {
    res.sendFile("uv.bundle.js", { root: uvPath });
});
app.get("/libs/runtime.js", (req, res) => {
    res.sendFile("uv.handler.js", { root: uvPath });
});
app.get("/libs/client.js", (req, res) => {
    res.sendFile("uv.client.js", { root: uvPath });
});
app.get("/libs/sw.js", (req, res) => {
    res.sendFile("uv.sw.js", { root: uvPath });
});

app.use("/libs/", express.static(uvPath));
app.use("/modules/", express.static(epoxyPath));
app.use("/vendor/", express.static(baremuxPath));

// Plain text 404 – no fancy page that reveals system complexity
app.use((req, res) => {
    res.status(404).send("Not Found");
});

const server = createServer();

server.on("request", (req, res) => {
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
    app(req, res);
});

server.on("upgrade", (req, socket, head) => {
    if (req.url.endsWith("/api/v1/sync/")) {
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
    console.log(`\tAccess gate: /gate-${getGateHash()}`);
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
