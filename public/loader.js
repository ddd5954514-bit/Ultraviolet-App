"use strict";
var _0xsw = ["\x2f\x6c\x69\x62\x73\x2f\x73\x77\x2e\x6a\x73"];
var _0xha = ["\x6c\x6f\x63\x61\x6c\x68\x6f\x73\x74", "\x31\x32\x37\x2e\x30\x2e\x30\x2e\x31"];

async function registerSW() {
	if (!navigator.serviceWorker) {
		if (
			location.protocol !== "https:" &&
			!_0xha.includes(location.hostname)
		)
			throw new Error("Secure context required for this feature.");

		throw new Error("Browser feature not supported.");
	}

	await navigator.serviceWorker.register(_0xsw[0], { scope: "/" });
}
