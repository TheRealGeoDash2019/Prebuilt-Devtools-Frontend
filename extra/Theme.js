(() => {
    const _ = new URL(location.href);
    const accentParam = _.searchParams.get("accent");
    if (accentParam) {
        const __ = document.createElement(`link`);
        __.rel = "stylesheet";
        __.href = "/extra/Theme.css";
        document.head.appendChild(__);
        document.querySelector(`html`).style.setProperty(`--palette-primary`, `${accentParam}deg`);
    }
})();
