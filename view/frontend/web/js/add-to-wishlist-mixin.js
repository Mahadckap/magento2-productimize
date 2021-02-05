/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */
define([
    'jquery',
    'mage/url',
    'jquery-ui-modules/widget'
], function ($, url) {
    'use strict';

    var allowSubmit = false;

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
                var saveCanvasUrl = url.build('productimize/index/savecanvas');
                if (typeof getArtwork == 'function') {
                    if (allowSubmit == false) {
                        var dataUrl = getArtwork('jpeg');
                        $.ajax({
                            showLoader: true,
                            url: saveCanvasUrl,
                            data: {
                                dataUrl: dataUrl
                            },
                            type: "POST",
                            success: function (data) {
                                self.assignPZCartProperties(data);
                                allowSubmit = true;
                                $('.towishlist').trigger('click');
                            }
                        });
                    }
                }
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
                    if ($('#pz_cart_properties').val() != '') {
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
                if ($('#pz_cart_properties').length > 0) {
                    if (this.checkifPZCartPropertiesset) {
                        if (allowSubmit == false) {
                            this._updateAddToWishlistButton(dataToAdd);
                            event.preventDefault();
                            event.stopPropagation();
                            return;
                        }
                        if (allowSubmit == true) {
                            this._updateAddToWishlistButton(dataToAdd);
                        }
                    }
                }
                if (!(element.validation() && element.validation('isValid'))) {
                    event.preventDefault();
                    event.stopPropagation();

                    return;
                }
            },
            assignPZCartProperties: function (imageData) {
                var encodedPZCartProperties = document.getElementById('pz_cart_properties').value;

                var pzCartProperties = null;

                if (encodedPZCartProperties) {
                    pzCartProperties = JSON.parse(encodedPZCartProperties)
                }

                var outputData = {}, pzCartOutputData = {};
                var loopInc = 0;


                for (const property in pzSelectedOptions) {
                    loopInc++;
                    const data = pzSelectedOptions[property];
                    outputData[property] = data.sku;
                    //outputData[property] += (data.sku) ? ' ';

                    if (imageData.imageUrl && loopInc == 1) {
                        outputData['CustomImage'] = imageData.imageUrl;
                    }
                }
                var glassDimention = getGlassDimention(null);
                if (loopInc == Object.keys(pzSelectedOptions).length) {

                    pzCartOutputData['Medium'] = (jQuery('.medium-select-elem')) ? jQuery('.medium-select-elem').val() : 'No Medium'
                    pzCartOutputData['Treatment'] = (jQuery('.treatment-select-elem')) ? jQuery('.treatment-select-elem').val() : 'No Treatment'
                    pzCartOutputData['Size'] = glassDimention[0] ?  glassDimention[0] : 100 + ' X ' + (glassDimention[1]) ? glassDimention[1] : 100;
                    pzCartOutputData['Frame'] = (outputData['frame']) ? outputData['frame'] : 'No Frame';
                    pzCartOutputData['Top Mat'] = (outputData['topMat']) ? outputData['topMat'] : 'No Top Mat';
                    pzCartOutputData['Bottom Mat'] = (outputData['bottomMat']) ? outputData['bottomMat'] : 'No Bottom Mat';
                    pzCartOutputData['Artwork Color'] = (jQuery('#pz-text')) ? jQuery('#pz-text').val() : 'No Artwork Color';
                    pzCartOutputData['Sidemark'] = (jQuery('.pz-textarea')) ? jQuery('.pz-textarea').val() : 'No Sidemark';


                    if (imageData.imageUrl) {
                        pzCartOutputData['CustomImage'] = imageData.imageUrl;
                    }
                    document.getElementById('pz_cart_properties').value = JSON.stringify(pzCartOutputData);
                }
            },
            checkifPZCartPropertiesset: function () {
                var encodedPZCartProperties = document.getElementById('pz_cart_properties').value;

                var pzCartProperties = null;

                if (encodedPZCartProperties) {
                    pzCartProperties = JSON.parse(encodedPZCartProperties)
                }

                var outputData = {}, pzCartOutputData = {};
                var loopInc = 0;


                for (const property in pzSelectedOptions) {
                    loopInc++;
                    const data = pzSelectedOptions[property];
                    outputData[property] = data.sku;
                    //outputData[property] += (data.sku) ? ' ';

                    if (imageData.imageUrl && loopInc == 1) {
                        outputData['CustomImage'] = imageData.imageUrl;
                    }
                }
                var glassDimention = getGlassDimention(null);
                if (loopInc == Object.keys(pzSelectedOptions).length) {

                    pzCartOutputData['Medium'] = (jQuery('.medium-select-elem')) ? jQuery('.medium-select-elem').val() : 'No Medium'
                    pzCartOutputData['Treatment'] = (jQuery('.treatment-select-elem')) ? jQuery('.treatment-select-elem').val() : 'No Treatment'
                    pzCartOutputData['Size'] = glassDimention[0] ?  glassDimention[0] : 100 + ' X ' + (glassDimention[1]) ? glassDimention[1] : 100;
                    pzCartOutputData['Frame'] = (outputData['frame']) ? outputData['frame'] : 'No Frame';
                    pzCartOutputData['Top Mat'] = (outputData['topMat']) ? outputData['topMat'] : 'No Top Mat';
                    pzCartOutputData['Bottom Mat'] = (outputData['bottomMat']) ? outputData['bottomMat'] : 'No Bottom Mat';
                    pzCartOutputData['Artwork Color'] = (jQuery('#pz-text')) ? jQuery('#pz-text').val() : 'No Artwork Color';
                    pzCartOutputData['Sidemark'] = (jQuery('.pz-textarea')) ? jQuery('.pz-textarea').val() : 'No Sidemark';


                    if (imageData.imageUrl) {
                        pzCartOutputData['CustomImage'] = imageData.imageUrl;
                    }
                    document.getElementById('pz_cart_properties').value = JSON.stringify(pzCartOutputData);
                }
                if ($('#pz_cart_properties').val() == '') {
                    return false;
                } else {
                    return true;
                }
            }
        });

        return $.mage.addToWishlist;
    }
});

