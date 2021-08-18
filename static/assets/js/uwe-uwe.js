const UWE_UWE = window.UWE_UWE || {};

UWE_UWE.FOOTNOTES = (() => {
    const config = {
        "fnRefSelector":      ".fn-ref",
        "fnSelector":         ".fn",
        "fnCloseBtnSelector": ".close-button",
        "vwSidenotes":        1104
    };

    const cache = {
        fnRefs: [],
        fns: [],
        vw: undefined
    };

    function init() {
        cacheElements();
        registerEventListeners();
        setFootnotesTopMargin();
    }

    function cacheElements() {
        cache.fnRefs    = document.querySelectorAll(config.fnRefSelector);
        cache.fns       = document.querySelectorAll(config.fnSelector);
        cache.fnFocused = undefined;
        cache.vw        = getViewPortWidth();
    }

    function registerEventListeners() {
        for (const fnRef of cache.fnRefs) {
            fnRef.addEventListener("click", function(e) {
                e.preventDefault();

                if ( isFnDisplayedAsSidenote() ) {
                    return;
                }

                displayFootnote( e.target.getAttribute("href").slice(1) );
            });
        }

        for (const fn of cache.fns) {
            const fnCloseBtn = fn.querySelector(config.fnCloseBtnSelector);

            if (fnCloseBtn === null) {
                continue;
            }

            fnCloseBtn.addEventListener("click", function(e) {
                e.preventDefault();

                if ( isFnDisplayedAsSidenote() ) {
                    return;
                }

                const fn = e.target.parentElement;

                if (fn === null) {
                    return;
                }

                if (fn.id !== cache.fnFocused.id) {
                    return;
                }

                hideFootnote();
            });
        }

        document.onkeydown = function(e) {
            if ( isFnDisplayedAsSidenote() ) {
                return;
            }

            e = e || window.event;

            if (!e || e.key !== "Escape" || !cache.fnFocused) { 
                return;
            }

            hideFootnote();
        };

        window.addEventListener("resize", (e) => {
            cache.vw = getViewPortWidth();

            if ( isFnDisplayedAsSidenote() ) {
                displayAllFootnotes();
                return;
            }

            hideAllFootnotes();
        });
    }

    function getViewPortWidth() {
        return Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    }

    function setFootnotesTopMargin() {
        if ( !isFnDisplayedAsSidenote() ) {
            return;
        }

        for (const fnRef of cache.fnRefs) {
            const fnRefOffsetTop = fnRef.offsetTop;
            const fnId = "fn-" + fnRef.id.slice(7);

            for (const fn of cache.fns) {
                if (fn.id !== fnId) {
                    continue;
                }

                fn.style["margin-top"] = (fnRefOffsetTop - fn.offsetTop) + "px";
            }
        }
    }

    function displayAllFootnotes() {
        for (const fn of cache.fns) {
            if ( isVisible(fn) ) {
                continue;
            }

            fn.style.display = "block";
        }
    }

    function hideAllFootnotes() {
        for (const fn of cache.fns) {
            if ( !isVisible(fn) ) {
                continue;
            }

            fn.style.display = "none";
        }
    }

    function hideFootnote() {
        cache.fnFocused.style.display = "none";
        cache.fnFocused = undefined;
    }

    function displayFootnote(fnId) {
        if (!fnId) {
            return;
        }

        if (cache.fnFocused) {
            cache.fnFocused.style.display = "none";
            cache.fnFocused = undefined;
        }

        for (const fn of cache.fns) {
            if (fn.id !== fnId) {
                continue;
            }

            cache.fnFocused = fn;
        }

        if (!cache.fnFocused) {
            return;
        }

        const styleFnFinal = window.getComputedStyle(cache.fnFocused, null);
        const marginRight = parseInt( styleFnFinal.marginRight.replace("px", "") );
        const marginLeft  = parseInt( styleFnFinal.marginLeft.replace("px", "") );

        if (marginRight !== 0 || marginLeft !== 0) {
            return;
        }

        if ( isVisible(cache.fnFocused) ) {
            return;
        }

        cache.fnFocused.style.display = "block";
    }

    function isVisible(e) {
        return !!( e.offsetWidth || e.offsetHeight || e.getClientRects().length );
    }

    function isFnDisplayedAsSidenote() {
        return cache.vw >= config.vwSidenotes;
    }

    return {
        init: init
    }
})();

UWE_UWE.TABS = (() => {
    const config = {
        "tabPanelSelector": '[role="tabpanel"]',
        "tabSelector": '[role="tab"]'
    };

    const cache = {
        tabs: undefined
    };

    function init() {
        cacheElements();
        registerEventListeners()
    }

    function cacheElements() {
        cache.tabs = document.querySelectorAll(config.tabSelector);
    }

    function registerEventListeners() {
        for (const tab of cache.tabs) {
            tab.addEventListener("click", function(e) {
                e.preventDefault();
                switchTabPanel(e.target);
            });
        }
    }

    function switchTabPanel(tabElement) {
        if (!tabElement) {
            return;
        }

        const tabContainerElement = tabElement.parentElement.parentElement;
        const idTabPanel = tabElement.getAttribute("href").slice(1);

        if (!tabContainerElement || !idTabPanel) {
            return;
        }

        const tabPanelElement = document.getElementById(idTabPanel);

        if (!tabPanelElement) {
            return;
        }

        const tabPanelsLocal = tabContainerElement.querySelectorAll(config.tabPanelSelector);
        const tabsLocalActive = tabContainerElement.querySelectorAll(config.tabSelector + ".active");

        for (const tabPanelLocal of tabPanelsLocal) {
            tabPanelLocal.classList.add("hidden");
            tabPanelLocal.setAttribute("aria-hidden", "true");
        }

        for (const tabLocalActive of tabsLocalActive) {
            tabLocalActive.classList.remove("active");
        }

        tabElement.classList.add("active");

        tabPanelElement.classList.remove("hidden");
        tabPanelElement.removeAttribute("aria-hidden");
    }

    return {
        init: init
    };
})();

UWE_UWE.TOC = (() => {
    const config = {
        "tocSelector": "#page-toc",
        "tocButtonSelector": "#toc-button",
    };

    const cache = {
        toc: undefined,
        tocButton: undefined,
        tocDisplayMode: undefined,
    };

    function init() {
        cacheElements();
        registerEventListeners()
    }

    function cacheElements() {
        cache.toc = document.querySelector(config.tocSelector);
        cache.tocButton = document.querySelector(config.tocButtonSelector);
        cache.tocDisplayMode = document.body.getAttribute("data-uwe-uwe-toc-display-mode");
    }

    function registerEventListeners() {

        if (cache.tocDisplayMode === "sticky") {
            const tocLinks = cache.toc.querySelectorAll("a");

            for (const tocLink of tocLinks) {
                tocLink.addEventListener("click", function(e) {
                    if ( !isTocInStickyMode() ) {
                        return;
                    }

                    toggleStickyToc();
                });
            }

            document.onkeydown = function(e) {
                e = e || window.event;

                if ( !e || e.key !== "Escape" || !isTocInStickyMode() ) { 
                    return;
                }

                toggleStickyToc();
            };
        }

        cache.tocButton.addEventListener("click", function(e) {
            e.preventDefault();

            if (cache.tocDisplayMode === "static") {
                return;
            }

            if (cache.tocDisplayMode === "mixed") {
                if ( isElementInViewport(cache.toc) ) {
                    return;
                }

                return toggleStickyToc();
            }

            if (cache.tocDisplayMode === "sticky") {
                return toggleStickyToc();
            }

            throw new Error(`Unknown display mode for toc (${cache.tocDisplayMode}).`);
        });
    }

    function isElementInViewport(el) {
        var rect = el.getBoundingClientRect();

        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    function addClass(el, className) {
        const classesSerialized = el.getAttribute("class");

        if (classesSerialized === null || classesSerialized === undefined || classesSerialized === "") {
            return el.setAttribute("class", className);
        }

        let classes = classesSerialized.trim().split(/\s/);
        classes.push(className);
        return el.setAttribute("class", classes.join(" ").trim());
    }

    function indexOfClass(el, className) {
        const classesSerialized = el.getAttribute("class");

        if (classesSerialized === null || classesSerialized === undefined || classesSerialized === "") {
            return -1;
        }

        return classesSerialized.trim().split(/\s/).indexOf(className);
    }

    function isTocInStickyMode() {
        return indexOfClass(cache.toc, "sticky") !== -1;
    }

    function removeClass(el, className) {
        let classesSerialized = el.getAttribute("class");

        if (classesSerialized === null || classesSerialized === undefined || classesSerialized === "") {
            return el.removeAttribute("class");
        }

        classesSerialized = classesSerialized.replace(className, "").trim();

        if (classesSerialized === "") {
            return el.removeAttribute("class");
        }

        return el.setAttribute("class", classesSerialized);
    }

    function toggleStickyToc() {
        const idx = indexOfClass(cache.toc, "sticky");

        if (idx === -1) {
            return addClass(cache.toc, "sticky");
        }

        return removeClass(cache.toc, "sticky");
    }

    return {
        init: init
    };
})();