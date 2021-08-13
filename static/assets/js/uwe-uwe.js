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

            const fnCloseBtn = fnRef.querySelector(config.fnCloseBtnSelector);

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