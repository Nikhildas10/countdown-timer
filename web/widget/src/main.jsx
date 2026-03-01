import { h, render } from "preact";
import App from "./countdown.jsx";

const mountId = "ct-widget-mount";

function boot() {
    const mount = document.getElementById(mountId);
    if (!mount) return;

    const apiHost = mount.dataset.apiHost || "";
    const shop = mount.dataset.shop || "";

    render(h(App, { apiHost, shop }), mount);
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
} else {
    boot();
}
