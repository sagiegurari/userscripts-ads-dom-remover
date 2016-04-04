// ==UserScript==
// @name         Ads DOM Remover
// @namespace    sagiegurari
// @version      0.55
// @author       Sagie Gur-Ari
// @description  Removes Ad Containers from DOM (doesn't replace adblocker extension, but blocks dynamic content which the adblocker fails to block by removing whole sections from the HTML DOM.)
// @homepage     https://github.com/sagiegurari/userscripts-ads-dom-remover
// @supportURL   https://github.com/sagiegurari/userscripts-ads-dom-remover/issues
// @match        http://www.ynet.co.il/home/*
// @match        http://www.ynet.co.il/articles/*
// @match        http://www.calcalist.co.il/*
// @match        http://www.globes.co.il/*
// @require      https://code.jquery.com/jquery-2.2.2.min.js
// @require      https://greasyfork.org/scripts/18490-ads-dom-remover-runner/code/Ads%20DOM%20Remover%20Runner.js?version=117422
// @grant        none
// @license      MIT License
// ==/UserScript==
/* jshint -W097 */

(function run($, runner) {
    'use strict';

    var selectorDefinitions = {
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
            '#c1_Hor',
            '#c2_Hor',
            '#c3_Hor',
            '#c4_Hor',
            '#c5_Hor',
            '#c6_Hor',
            '.homepagevideo-x6',
            '.buyandsave',
            '.general-image',
            '[name="ExternalWebpageIframe"]', {
                selector: 'iframe',
                filter: function ($element) {
                    return !$element.parent().hasClass('news_ticker_iframe');
                }
            }, {
                selector: 'div.B2b.block div',
                pre: function ($element) {
                    $element.parent().css({
                        height: '1px'
                    });
                }
            }
        ],
        globes: [
            '#chromeWindow', {
                selector: 'iframe',
                filter: function ($element) {
                    var id = $element.attr('id');
                    var src = $element.attr('src') || '';
                    return (id !== 'GlobalFinanceData_home') && (src.indexOf('/news/') !== -1);
                }
            }
        ]
    };

    runner($, {
        getSelectors: function (hostName) {
            var selectors;
            if (hostName.indexOf('globes') !== -1) {
                selectors = selectorDefinitions.globes;
            } else { //ynet/calcalist
                selectors = selectorDefinitions.ynet;
            }

            return selectors;
        }
    });
}(window.$, window.adrRunner));
