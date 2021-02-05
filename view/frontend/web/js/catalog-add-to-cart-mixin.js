/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */
define([
    'jquery',
    'mage/url',
    'jquery-ui-modules/widget',
], function ($, url) {
    'use strict';

    return function (widget) {

        $.widget('mage.catalogAddToCart', widget, {
            submitForm: function (form) {
                var self = this;
                console.log("submit before");
                var saveCanvasUrl = url.build('productimize/index/savecanvas');
                //var canvas = document.getElementById("pz-canvas");
                //var dataUrl = canvas.toDataURL("image/jpeg");
                if (typeof getArtwork == 'function') {
                    var dataUrl = getArtwork('jpeg');
                    $.ajax({
                        showLoader: true,
                        url: saveCanvasUrl,
                        data: {
                            dataUrl: dataUrl
                        },
                        type: "POST",
                        success: function (data) {
                            console.log("submit 1");
                            console.log(data);
                            self.assignPZCartProperties(data);
                            setTimeout(function () {
                                self.ajaxSubmit(form);
                            }, 3000)

                            console.log("submit last");
                        }
                    });
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

                    var value = ", Gold, <span class='hint'><i class='fa fa-info-circle' aria-hidden='true'></i> Weighted<span class='pz-tooltip-content'>Left: 1.5 Top: 1.5 Right: 1.5 Bottom: 1.5</span></span>"

                    pzCartOutputData['Medium'] = (jQuery('.medium-select-elem')) ? jQuery('.medium-select-elem').val() : 'No Medium'
                    pzCartOutputData['Treatment'] = (jQuery('.treatment-select-elem')) ? jQuery('.treatment-select-elem').val() : 'No Treatment'
                    pzCartOutputData['Size'] = (glassDimention[0]) ? glassDimention[0] : 100 + '×' + (glassDimention[1]) ? glassDimention[1] : 100;
                    pzCartOutputData['Frame'] = (outputData['frame']) ? outputData['frame'] : 'No Frame';
                    pzCartOutputData['Top Mat'] = (outputData['topMat']) ? value + outputData['topMat'] : 'No Top Mat';
                    pzCartOutputData['Bottom Mat'] = (outputData['bottomMat']) ? value + outputData['bottomMat'] : 'No Bottom Mat';
                    pzCartOutputData['Artwork Color'] = (jQuery('#pz-text')) ? jQuery('#pz-text').val() : 'No Artwork Color';
                    pzCartOutputData['Sidemark'] = (jQuery('.pz-textarea')) ? jQuery('.pz-textarea').val() : 'No Sidemark';


                    if (imageData.imageUrl) {
                        pzCartOutputData['CustomImage'] = imageData.imageUrl;
                    }
                    document.getElementById('pz_cart_properties').value = JSON.stringify(pzCartOutputData);
                }
            }
        });

        return $.mage.catalogAddToCart;
    }
});


