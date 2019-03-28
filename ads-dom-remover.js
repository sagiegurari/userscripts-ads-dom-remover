// ==UserScript==
// @name         Ads DOM Remover
// @namespace    sagiegurari
// @version      1.26
// @author       Sagie Gur-Ari
// @description  Removes Ad Containers from DOM (doesn't replace adblocker extension, but blocks dynamic content which the adblocker fails to block by removing whole sections from the HTML DOM.)
// @homepage     https://github.com/sagiegurari/userscripts-ads-dom-remover
// @supportURL   https://github.com/sagiegurari/userscripts-ads-dom-remover/issues
// @match        http://www.ynet.co.il/home/*
// @match        https://www.ynet.co.il/home/*
// @match        http://www.ynet.co.il/articles/*
// @match        https://www.ynet.co.il/articles/*
// @match        http://www.mynet.co.il/articles/*
// @match        https://www.mynet.co.il/articles/*
// @match        http://www.calcalist.co.il/*
// @match        https://www.calcalist.co.il/*
// @match        http://www.globes.co.il/*
// @match        https://www.globes.co.il/*
// @match        https://sourceforge.net/projects/*/download*
// @match        https://sourceforge.net/projects/*/postdownload*
// @match        http://subscenter.cinemast.com/*
// @match        https://subscenter.cinemast.com/*
// @match        http://www.subscenter.co/*
// @match        https://www.subscenter.co/*
// @match        http://www.subscenter.org/*
// @match        https://www.subscenter.org/*
// @match        https://*.wikipedia.org/*
// @match        http://*.techonthenet.com/*
// @match        https://*.techonthenet.com/*
// @match        http://www.opensubtitles.org/*
// @match        https://www.opensubtitles.org/*
// @match        http://*.wikia.com/wiki/*
// @match        https://*.wikia.com/wiki/*
// @match        http://*.reddit.com/*
// @match        https://*.reddit.com/*
// @match        http://*.youtube.com/*
// @match        https://*.youtube.com/*
// @match        http://*.bostonglobe.com/*
// @match        https://*.bostonglobe.com/*
// @require      https://code.jquery.com/jquery-2.2.2.min.js
// @require      https://greasyfork.org/scripts/18490-ads-dom-remover-runner/code/Ads%20DOM%20Remover%20Runner.js?version=684030
// @grant        none
// @license      MIT License
// ==/UserScript==

(function run($, runner) {
    'use strict';

    var selectorDefinitions = {
        ynet: {
            hostNames: [
                'ynet',
                'calcalist'
            ],
            selectors: [
                '#colorbox',
                '#cboxOverlay',
                '#ads.premium',
                '#articleLayoutrightsidtable',
                '#google_image_div',
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
                '.PhotoArticlesTalkbacks',
                '[name="ExternalWebpageIframe"]',
                '#PROCOIL_SearchForm',
                '#magazines1024',
                '[id^="promo_"]',
                '[id^="ads."]',
                '[class*="facebook"]',
                '[class*="WinWin"]',
                '.main_search_radio',
                'tr td [id^="ads."]',
                '.art-action-wrp',
                '.header-user-profile',
                '.left-art-content',
                '[class*="GeneralBanner"]',
                '#vilon',
                '#prime.shook',
                '#articlebottomsharinglinks',
                '.floatingPlayerimReallyDummy_container',
                '#ynet_user_login',
                '[title="YouTube"]',
                '[title="facebook"]',
                '#INDbtnWrap',
                {
                    selector: '.homepagelitevideo',
                    fineTuneSelector: function ($element) {
                        return $element.parent().parent();
                    }
                },
                {
                    selector: 'iframe',
                    fineTuneSelector: function ($element) {
                        return $element.filter(function () {
                            return !$(this).parent().hasClass('news_ticker_iframe');
                        });
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
            ]
        },
        globes: {
            hostNames: 'globes',
            selectors: [
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
        techonthenet: {
            hostNames: 'techonthenet.com',
            selectors: ['.adsblocked']
        },
        sourceforge: {
            hostNames: 'sourceforge.net',
            selectors: [
                '#content-for-adblock',
                '#newsletter-floating',
                '#page-body'
            ]
        },
        subscenter: {
            hostNames: 'subscenter',
            selectors: [
                '.weekBottom',
                '.reviewsWindow',
                '#banner_cinemast',
                '.bottomMenu',
                'footer',
                '#paypal',
                '#aboveSite',
                {
                    selector: '#subtitles_list a[href="/he/contactus/"]',
                    fineTuneSelector: function ($element) {
                        return $element.parent();
                    }
                }
            ]
        },
        wikipedia: {
            hostNames: 'wikipedia.org',
            selectors: [
                '#frbanner',
                '#frb-inline',
                '#wlm-banner',
                '#centralNotice',
                '.frb-main',
                '.frbanner',
                '.frm',
                '.frb'
            ]
        },
        opensubtitles: {
            hostNames: 'opensubtitles',
            selectors: ['.rec_container_right']
        },
        wikia: {
            hostNames: 'wikia.com',
            selectors: [
                '.WikiaFooter',
                '.WikiaRail',
                '.wds-global-footer'
            ]
        },
        reddit: {
            hostNames: 'reddit.com',
            selectors: [
                '#onboarding-splash',
                '[id^="google_ads"]'
            ]
        },
        youtube: {
            hostNames: 'youtube.com',
            selectors: [
                '.ytp-ce-element',
                'ytd-companion-slot-renderer',
                '#masthead-ad',
                '.video-ads ytp-ad-module',
                '.ytp-ad-overlay-ad-info-dialog-container',
                '.ytp-ad-overlay-slot'
            ],
            options: {
                loops: 200,
                interval: 2500
            }
        },
        bostonglobe: {
            hostNames: 'bostonglobe.com',
            selectors: [
                '.meter-social-connect',
                '.meter-social-connect__container'
            ]
        }
    };

    [
        '#dcPremiumRightImg',
        '.boulevard',
        '#multiarticles-9',
        '#multiarticles-12',
        '#multiarticles-13',
        '#multiarticles-14',
        '#multiarticles-15',
        '#multiarticles-16',
        '.CdaMostViews',
        '.CdaCalcalistToday',
        '.CdaRecomendedMovies',
        '#SpecialBuilder1280',
        '.cdaFooter1280'
    ].forEach(function addSelector(selector) {
        selectorDefinitions.ynet.selectors.push({
            selector: selector,
            fineTuneSelector: function ($element) {
                return $element.parent();
            }
        });
    });

    runner($, {
        getSelectorDefinitions: function () {
            return selectorDefinitions;
        }
    });
}(window.jQuery.noConflict(true), window.adrRunner));
