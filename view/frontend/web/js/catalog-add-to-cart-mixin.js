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
                        },3000)
                        
                        console.log("submit last");
                    }
                });
            },
            assignPZCartProperties: function (imageUrl) {
                var encodedPZCartProperties = document.getElementById('pz_cart_properties').value;

                var pzCartProperties = null;

                if (encodedPZCartProperties) {
                    pzCartProperties = JSON.parse(encodedPZCartProperties)
                }

                var outputData = {};
                var loopInc = 0;

                for (const property in pzSelectedOptions) {
                    loopInc++;
                    const data = pzSelectedOptions[property];
                    outputData[property] = data.sku;

                    if (imageUrl && loopInc == 1) {
                        outputData['CustomImage'] = imageUrl;
                    }
                }
                if (loopInc == Object.keys(pzSelectedOptions).length) {
                    document.getElementById('pz_cart_properties').value = JSON.stringify(outputData);
                }
            }
        });

        return $.mage.catalogAddToCart;
    }
});
