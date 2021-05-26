const UWE_UWE = window.UWE_UWE || {};

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

        console.log(tabContainerElement);

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