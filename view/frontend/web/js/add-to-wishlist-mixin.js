/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */
define([
    'jquery',
    'jquery-ui-modules/widget'
], function ($) {
    'use strict';

    return function (widget) {

        $.widget('mage.addToWishlist', widget, {
            _bind: function () {
                var options = this.options,
                    dataUpdateFunc = '_updateWishlistData',
                    validateProductQty = '_validateWishlistQty',
                    changeCustomOption = 'change ' + options.customOptionsInfo,
                    changeQty = 'change ' + options.qtyInfo,
                    updateWishlist = 'click ' + options.actionElement,
                    events = {},
                    key;

                if ('productType' in options) {
                    if (typeof options.productType === 'string') {
                        options.productType = [options.productType];
                    }
                } else {
                    options.productType = [];
                }

                events[changeCustomOption] = dataUpdateFunc;
                events[changeQty] = dataUpdateFunc;
                events[updateWishlist] = validateProductQty;

                for (key in options.productType) {
                    if (options.productType.hasOwnProperty(key) && options.productType[key] + 'Info' in options) {
                        events['change ' + options[options.productType[key] + 'Info']] = dataUpdateFunc;
                    }
                }
                //
                var changeMedium = 'change #medium';
                events[changeMedium] = dataUpdateFunc;
                var changeSize = 'change #size';
                events[changeSize] = dataUpdateFunc;
                //
                this._on(events);
            },
            _updateWishlistData: function (event) {
                var dataToAdd = {},
                    isFileUploaded = false,
                    self = this;
                if (event.handleObj.selector == this.options.qtyInfo) { //eslint-disable-line eqeqeq
                    this._updateAddToWishlistButton({});
                    event.stopPropagation();

                    return;
                }
                $(event.handleObj.selector).each(function (index, element) {
                    if ($(element).is('input[type=text]') ||
                        $(element).is('input[type=email]') ||
                        $(element).is('input[type=number]') ||
                        $(element).is('input[type=hidden]') ||
                        $(element).is('input[type=checkbox]:checked') ||
                        $(element).is('input[type=radio]:checked') ||
                        $(element).is('textarea') ||
                        $('#' + element.id + ' option:selected').length
                    ) {
                        if ($(element).data('selector') || $(element).attr('name')) {
                            dataToAdd = $.extend({}, dataToAdd, self._getElementData(element));
                        }

                        return;
                    }

                    if ($(element).is('input[type=file]') && $(element).val()) {
                        isFileUploaded = true;
                    }
                });

                if (isFileUploaded) {
                    this.bindFormSubmit();
                }
                this._updateAddToWishlistButton(dataToAdd);
                event.stopPropagation();
            },
            _updateAddToWishlistButton: function (dataToAdd) {
                var self = this;

                $('[data-action="add-to-wishlist"]').each(function (index, element) {
                    var params = $(element).data('post');

                    if (!params) {
                        params = {
                            'data': {}
                        };
                    }

                    params.data = $.extend({}, params.data, dataToAdd, {
                        'qty': $(self.options.qtyInfo).val()
                    });
                    if($('#pz_cart_properties').val() != ''){
                        params.data = $.extend({}, params.data, dataToAdd, {
                            'pz_cart_properties': $('#pz_cart_properties').val()
                        });
                        params.data = $.extend({}, params.data, dataToAdd, {
                            'edit_id': 1
                        });
                    }
                    $(element).data('post', params);
                });
            },
            _validateWishlistQty: function (event) {
                var element = $(this.options.qtyInfo);
                var dataToAdd = {};
                this._updateAddToWishlistButton(dataToAdd);
                if (!(element.validation() && element.validation('isValid'))) {
                    event.preventDefault();
                    event.stopPropagation();

                    return;
                }
            }
        });

        return $.mage.addToWishlist;
    }
});
