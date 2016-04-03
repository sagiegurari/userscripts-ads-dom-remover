/*global console */

(function run() {
    'use strict';

    /**
     * This class invokes the ads removing process based on provided options.
     *
     * @author Sagie Gur-Ari
     * @class ADRService
     * @public
     * @param {object} $ - The jquery library
     * @param {object} options - The process options
     * @param {function} options.getSelectors - Called with a host name and returns an array of selector strings to remove (or objects with more complex definition)
     * @param {number} [options.loops=10] - The amount of loops to run (will be invoked twice)
     * @param {number} [options.interval=250] - Time in millies between each loop
     */
    var Service = function ($, options) {
        this.$ = $;
        this.getSelectorsExternal = options.getSelectors || this.noop;
        this.loops = options.loops || 10;
        this.interval = options.interval || 250;

        this.state = {
            intervalID: null,
            counter: 0,
            secondLoop: false
        };
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
            selectors = this.getSelectorsExternal(hostName);
        } catch (error) {
            console.error('[user script][Ads DOM Remover][getSelectors] Error:', error);
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

                if (selector.pre) {
                    selector.pre($element);
                }

                var remove = true;
                if (selector.filter) {
                    remove = selector.filter($element);
                }

                if (remove) {
                    $element.remove();
                }

                console.debug('[user script][Ads DOM Remover][hideElements] Found:', selector, 'count:', $element.length, 'in website and removed it.');
            }
        });

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

    window.adrRunner = {
        /**
         * Starts the service run.
         *
         * @function
         * @memberof! ADRService
         * @public
         * @param {object} $ - The jquery library
         * @param {object} options - The process options
         * @param {function} options.getSelectors - Called with a host name and returns an array of selector strings to remove (or objects with more complex definition)
         * @param {number} [options.loops=10] - The amount of loops to run (will be invoked twice)
         * @param {number} [options.interval=250] - Time in millies between each loop
         */
        run: function run($, options) {
            var service = new Service($, options);
            service.start();
        }
    };
}());