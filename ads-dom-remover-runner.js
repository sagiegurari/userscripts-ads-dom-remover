// ==UserScript==
// @name         Ads DOM Remover Runner
// @namespace    sagiegurari
// @version      0.07
// @author       Sagie Gur-Ari
// @description  Library - Removes Ad Containers from DOM (doesn't replace adblocker extension, but blocks dynamic content which the adblocker fails to block by removing whole sections from the HTML DOM.)
// @homepage     https://github.com/sagiegurari/userscripts-ads-dom-remover
// @supportURL   https://github.com/sagiegurari/userscripts-ads-dom-remover/issues
// @grant        none
// @license      MIT License
// ==/UserScript==
/*global console*/

(function initADR() {
    'use strict';

    /**
     * This class invokes the ads removing process based on provided options.
     *
     * @author Sagie Gur-Ari
     * @class ADRService
     * @public
     * @param {object} $ - The jquery library
     * @param {object} [options] - The process options
     * @param {function} [options.getSelectorDefinitions] - Returns all selector definitions per host
     * @param {number} [options.loops=10] - The amount of loops to run (will be invoked twice)
     * @param {number} [options.interval=250] - Time in millies between each loop
     */
    var Service = function ($, options) {
        /*eslint-disable no-invalid-this*/
        this.$ = $;
        options = options || {};
        this.loops = options.loops || 10;
        this.interval = options.interval || 250;

        var getSelectorDefinitions = options.getSelectorDefinitions || this.noop;
        this.selectorDefinitions = getSelectorDefinitions() || {};

        //find default selectors
        this.defaultSelectors = null;
        var index;
        var id;
        this.ids = Object.keys(this.selectorDefinitions);
        for (index = 0; index < this.ids.length; index++) {
            id = this.ids[index];

            if (this.selectorDefinitions[id].hostNames === true) {
                this.defaultSelectors = this.selectorDefinitions[id];
                break;
            }
        }

        this.defaultSelectors = this.defaultSelectors || [];

        this.state = {
            intervalID: null,
            counter: 0,
            secondLoop: false
        };
        /*eslint-enable no-invalid-this*/
    };

    /**
     * Empty function
     *
     * @function
     * @memberof! ADRService
     * @private
     * @returns {undefined} Always undefined
     */
    Service.prototype.noop = function () {
        return undefined;
    };

    /**
     * Returns the selectors to remove based on the provided host name.
     *
     * @function
     * @memberof! ADRService
     * @private
     * @param {string} hostName - The current host name
     * @returns {Array} Array of selectors (or objects) to remove from the DOM
     */
    Service.prototype.getSelectors = function (hostName) {
        var selectors;

        try {
            var definitionIndex;
            var hostNameIndex;
            var id;
            var hostNames;
            for (definitionIndex = 0; definitionIndex < this.ids.length; definitionIndex++) {
                id = this.ids[definitionIndex];
                hostNames = this.selectorDefinitions[id].hostNames;

                if ((typeof hostNames === 'string') && (hostName.indexOf(hostNames) !== -1)) {
                    selectors = this.selectorDefinitions[id].selectors;
                } else if (Array.isArray(hostNames)) {
                    for (hostNameIndex = 0; hostNameIndex < hostNames.length; hostNameIndex++) {
                        if (hostName.indexOf(hostNames[hostNameIndex]) !== -1) {
                            selectors = this.selectorDefinitions[id].selectors;
                            break;
                        }
                    }
                }

                if (selectors) {
                    break;
                }
            }
        } catch (error) {
            console.error('[user script][Ads DOM Remover][getSelectors] Error:', error);
        }

        if (!selectors) {
            selectors = this.defaultSelectors;
        }

        selectors = selectors || [];

        return selectors;
    };

    /**
     * Hides the elements by removing them from the DOM completely.
     *
     * @function
     * @memberof! ADRService
     * @private
     * @returns {boolean} True if any element was removed during this invocation
     */
    Service.prototype.hideElements = function () {
        var self = this;
        var found = false;

        var selectors = self.getSelectors(document.location.hostname);
        if (selectors) {
            if ((!Array.isArray(selectors)) && selectors.selectors) {
                if (selectors.id) {
                    console.debug('[user script][Ads DOM Remover][hideElements] Using Selectors:', selectors.id);
                }

                selectors = selectors.selectors;
            }

            selectors.forEach(function (selector) {
                var selectorString = selector.selector || selector;

                var $element;
                try {
                    $element = self.$(selectorString);
                } catch (error) {
                    console.error('[user script][Ads DOM Remover][hideElements] Error while running selector:', selectorString, error);
                }

                if ($element && $element.length) {
                    found = true;

                    if (selector.fineTuneSelector && (typeof selector.fineTuneSelector === 'function')) {
                        $element = selector.fineTuneSelector($element);
                    }

                    if (selector.pre && (typeof selector.pre === 'function')) {
                        selector.pre($element);
                    }

                    var remove = true;
                    if (selector.filter && (typeof selector.filter === 'function')) {
                        remove = selector.filter($element);
                    }

                    if (remove) {
                        $element.remove();
                    }

                    console.debug('[user script][Ads DOM Remover][hideElements] Found:', selector, 'count:', $element.length, 'in website and removed it.');
                }
            });
        }

        return found;
    };

    /**
     * Invoked each interval to run the main library logic.
     *
     * @function
     * @memberof! ADRService
     * @private
     */
    Service.prototype.actionLoop = function () {
        this.state.counter++;
        var stopInterval = this.state.intervalID && (this.state.counter > this.loops);
        console.debug('[user script][Ads DOM Remover][actionLoop] Running loop:', this.state.counter, 'state:', this.state, 'stop interval:', stopInterval);

        this.hideElements();

        if (stopInterval) {
            console.debug('[user script][Ads DOM Remover][actionLoop] Clearing interval ID:', this.state.intervalID);
            clearInterval(this.state.intervalID);
            this.state.intervalID = null;

            if (!this.state.secondLoop) {
                this.startActionLoop(false, 2500);
            }
        }
    };

    /**
     * Starts the interval invocations.
     *
     * @function
     * @memberof! ADRService
     * @private
     * @param {boolean} firstTime - If this function was called for the first time
     * @param {number} delay - The delay to wait before setting the interval
     */
    Service.prototype.startActionLoop = function (firstTime, delay) {
        var self = this;

        self.state.secondLoop = !firstTime;
        self.state.counter = 0;

        setTimeout(function () {
            self.state.intervalID = setInterval(function () {
                self.actionLoop();
            }, self.interval);

            setTimeout(function () {
                self.hideElements();
            }, 15000);
        }, delay);
    };

    /**
     * Starts the service run.
     *
     * @function
     * @memberof! ADRService
     * @private
     */
    Service.prototype.start = function () {
        this.startActionLoop(true, 0);
    };

    /**
     * Starts the service run.
     *
     * @function
     * @namespace ADRRunner
     * @public
     * @param {object} $ - The jquery library
     * @param {object} options - The process options
     * @param {function} options.getSelectorDefinitions - Returns all selector definitions per host
     * @param {number} [options.loops=10] - The amount of loops to run (will be invoked twice)
     * @param {number} [options.interval=250] - Time in millies between each loop
     */
    window.adrRunner = function run($, options) {
        if ($ && (typeof $ === 'function') && options && options.getSelectorDefinitions && (typeof options.getSelectorDefinitions === 'function')) {
            var service = new Service($, options);
            service.start();
        }
    };
}());
