"use strict";
var _0xe = document.getElementById("forecast-status");
var _0xc = document.getElementById("forecast-detail");
var _0xb = document.getElementById("btn-refresh");

if (location.pathname.startsWith(__uv$config.prefix)) {
	_0xe.textContent = "Error: Background process not initialized.";
	_0xb.classList.add("show");
}

_0xb.addEventListener("click", async () => {
	try {
		await registerSW();
		location.reload();
	} catch (err) {
		_0xe.textContent = "Initialization failed.";
		_0xc.textContent = err.toString();
		_0xb.classList.remove("show");
	}
});
