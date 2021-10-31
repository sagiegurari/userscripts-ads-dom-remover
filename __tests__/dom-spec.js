'use strict';

const $ = require('jquery');
require('../ads-dom-remover-runner');

describe('DOM Tests', () => {
    jest.setTimeout(5 * 60 * 1000);

    const runFlow = (hostname, onDone) => {
        return new Promise((resolve, reject) => {
            document.body.innerHTML = `<div>
                    <span class="ad bad">bad</span>
                    <span class="ad bad">bad</span>
                    <span class="bad">
                        <span class="ad-child bad">bad</span>
                    </span>
                    <span class="onepixel" style="height:2px">
                        <span class="ad-pre bad">bad</span>
                    </span>
                    <span class="ad-filter">ok</span>
                    <span class="ad-filter bad" id="remove-me">bad</span>
                    <span class="bad">
                        <span class="ad-child bad">bad</span>
                    </span>
                    <span class="ad bad">bad</span>
                    <span class="ad bad">bad</span>
                </div>`;

            window.adrRunner.mockHostname = hostname;
            window.adrRunner(
                $, {
                    loops: 1,
                    interval: 1,
                    secondLoopInterval: 1,
                    getSelectorDefinitions: function () {
                        return {
                            test: {
                                hostNames: [
                                    'test1',
                                    'test2'
                                ],
                                selectors: [
                                    '.ad',
                                    {
                                        selector: '.ad-child',
                                        fineTuneSelector: function ($element) {
                                            return $element.parent();
                                        }
                                    },
                                    {
                                        selector: '.ad-pre',
                                        pre: function ($element) {
                                            $element.parent().css({
                                                height: '1px'
                                            });
                                        }
                                    },
                                    {
                                        selector: '.ad-filter',
                                        filter: function ($element) {
                                            return $element.filter('#remove-me');
                                        }
                                    }
                                ]
                            }
                        };
                    },
                    onDone: () => {
                        onDone(resolve, reject);
                    }
                }
            );
        });
    };

    it('correct host', () => {
        return runFlow('test1', (resolve, reject) => {
            if (document.querySelector('.bad')) {
                return reject(`found bad elements, DOM: ${document.body.innerHTML}`);
            }
            if (document.querySelector('.onepixel').getAttribute('style') !== 'height: 1px;') {
                return reject(`Unable to modify elements, DOM: ${document.body.innerHTML}`);
            }
            resolve();
        });
    });

    it('wrong host', () => {
        return runFlow('bad', (resolve, reject) => {
            if (!document.querySelector('.bad')) {
                return reject(`All bad elements removed, DOM: ${document.body.innerHTML}`);
            }
            if (document.querySelector('.onepixel').getAttribute('style') === 'height: 1px;') {
                return reject(`CSS modified, DOM: ${document.body.innerHTML}`);
            }
            resolve();
        });
    });

    it('e2e', () => {
        window.adrRunner.mockHostname = '__tests1__';
        document.body.innerHTML = `<div>
                    <span class="ad1 bad">bad</span>
                    <span class="ad2 bad">bad</span>
                    <span class="ad2 bad">bad</span>
                    <span class="ad2 bad">bad</span>
                    <span class="ad3 good">bad</span>
                </div>`;
        window.jQuery = $;
        require('../ads-dom-remover');

        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (!document.querySelector('.bad')) {
                    return reject(`All bad elements removed, DOM: ${document.body.innerHTML}`);
                }
                resolve();
            }, 10);
        });
    });
});
