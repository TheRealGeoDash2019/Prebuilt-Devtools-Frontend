(() => {
    const _ = new URL(location.href);
    const accentParam = _.searchParams.get("accent");
    const rainbowParam = _.searchParams.has("rainbow");
    if (accentParam || rainbowParam) {
        const __ = document.createElement(`link`);
        __.rel = "stylesheet";
        __.href = "/extra/Theme.css";
        document.head.appendChild(__);
        document.querySelector(`html`).style.setProperty(`--palette-primary`, `${accentParam}deg`);
        if (rainbowParam) {
          document.querySelector("html").style.animation = "3s linear rainbowUi infinite";
          document.querySelector("html").classList.add("rainbow");
          document.querySelector("body").classList.add("rainbow");
        }
    }
})();
