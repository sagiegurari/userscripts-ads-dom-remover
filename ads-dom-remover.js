// ==UserScript==
// @name         Ads DOM Remover
// @namespace    sagiegurari
// @version      0.45
// @author       Sagie Gur-Ari
// @description  Removes Ad Containers from DOM (doesn't replace adblocker extension, but blocks dynamic content which the adblocker fails to block by removing whole sections from the HTML DOM.)
// @homepage     https://github.com/sagiegurari/userscripts-ads-dom-remover
// @supportURL   https://github.com/sagiegurari/userscripts-ads-dom-remover/issues
// @match        http://www.ynet.co.il/home/*
// @match        http://www.ynet.co.il/articles/*
// @match        http://www.calcalist.co.il/*
// @match        http://www.globes.co.il/*
// @require      https://code.jquery.com/jquery-2.2.2.min.js
// @grant        none
// @license      MIT License
// ==/UserScript==
/* jshint -W097 */
'use strict';

(function run($) {
    var service = {
        state: {
            intervalID: null,
            counter: 0,
            secondLoop: false
        },
        selectors: {
            ynet: [
                '#colorbox',
                '#cboxOverlay',
                '#ads.premium',
                'img[src*="dynamicyield"]',
                'div.MSCmainContent',
                '[id*="arketingCarouse"]',
                '[id*="arketingRecommended"]',
                '.mainVerticalArticleSharingLinks',
                '.OUTBRAIN',
                '.topBannerWrap',
                '.block.B3 .B3.ghcite.dyother.dyMonitor div',
                '.bigdealhomepage',
                '#ww6s_Main',
                '.buyandsavedy',
                '.area.footer.ghcite',
                '.hdr_set_homepage',
                {
                    selector: 'iframe',
                    filter: function ($element) {
                        return !$element.parent().hasClass('news_ticker_iframe');
                    }
                },
                {
                    selector: 'div.B2b.block div',
                    pre: function ($element) {
                        $element.parent().css({
                            height: '1px'
                        });
                    }
                }
            ],
            globes: [
                '#chromeWindow',
                {
                    selector: 'iframe',
                    filter: function ($element) {
                        var id = $element.attr('id');
                        var src = $element.attr('src') || '';
                        return (id !== 'GlobalFinanceData_home') && (src.indexOf('/news/') !== -1);
                    }
                }
            ]
        },
        getSelectors: function (hostName) {
            var selectors;
            if (hostName.indexOf('globes') !== -1) {
                selectors =  this.selectors.globes;
            } else { //ynet/calcalist
                selectors =  this.selectors.ynet;
            }

            return selectors;
        },
        hideElements: function () {
            var found = false;

            var selectors = this.getSelectors(document.location.hostname);

            selectors.forEach(function (selector) {
                var selectorString = selector.selector || selector;

                var $element;
                try {
                    $element = $(selectorString);
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
        },
        actionLoop: function () {
            this.state.counter++;
            var stopInterval = this.state.intervalID && (this.state.counter > 10);
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
        },
        startActionLoop: function (firstTime, delay) {
            var self = this;

            self.state.secondLoop = !firstTime;
            self.state.counter = 0;

            setTimeout(function() {
                self.state.intervalID = setInterval(function () {
                    self.actionLoop();
                }, 150);
                setTimeout(function () {
                    self.hideElements();
                }, 15000);
            }, delay);
        },
        run: function () {
            this.startActionLoop(true, 0);
        }
    };

    service.run();
}(window.$));
