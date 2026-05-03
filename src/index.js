import { join } from "node:path";
import { hostname } from "node:os";
import { createServer } from "node:http";
import express from "express";
import wisp from "wisp-server-node";

import { uvPath } from "@titaniumnetwork-dev/ultraviolet";
import { epoxyPath } from "@mercuryworkshop/epoxy-transport";
import { baremuxPath } from "@mercuryworkshop/bare-mux/node";

const app = express();

// הנתיב הראשי - מציג דף "בבנייה" תמים לכל מי שנכנס לכתובת הרגילה
app.get('/', (req, res) => {
	res.send(`
		<!DOCTYPE html>
		<html dir="rtl">
		<head>
			<meta charset="UTF-8">
			<title>בבנייה</title>
			<style>
				body { font-family: sans-serif; text-align: center; margin-top: 15%; color: #333; }
			</style>
		</head>
		<body>
			<h1>האתר בבנייה</h1>
			<p>נחזור לפעילות בהקדם.</p>
		</body>
		</html>
	`);
});

// הנתיב הסודי שלך - טוען את הממשק רק כשניגשים ל-UUID המדויק
app.use("/06e566d6-131a-42ab-8918-47367b6b8cb2", express.static("./public"));

// טעינת קבצי הליבה של המערכת (נשארים בנתיב המקורי כדי שהקוד בדפדפן לא יישבר)
app.use("/uv/", express.static(uvPath));
app.use("/epoxy/", express.static(epoxyPath));
app.use("/baremux/", express.static(baremuxPath));

// טיפול בשגיאות - מחזיר שגיאת 404 גנרית ולא מחשידה לכל נתיב אחר שאינו קיים
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
