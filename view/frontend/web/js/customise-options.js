define([
    "jquery"
], function ($) {
    "use strict";
    $.widget('mage.customisedOptions', {
        options: {
            sizeOptionDiv: '.pz-customizer-section .pz-custom-content-wrapper .size-option',
            linerOptionDiv: '.pz-customizer-section .pz-custom-content-wrapper .liner-option',
            topMatOptionDiv: '.pz-customizer-section .pz-custom-content-wrapper .topmat-option',
            bottomMatOptionDiv: '.pz-customizer-section .pz-custom-content-wrapper .bottommat-option',
            mediumOptionDiv: '.pz-customizer-section .pz-custom-content-wrapper .medium-option',
            frameOptionDiv: '.pz-customizer-section .pz-custom-content-wrapper .frame-option',
            //treamentSelectDiv: '.pz-customizer-section .pz-custom-content-wrapper .medium-option .treatment-select-elem',
            mediumTabSelectDiv: '.pz-customizer-section .pz-custom-content-wrapper .medium-option .treatment-select-elem, .pz-customizer-section .pz-custom-content-wrapper .medium-option .medium-select-elem',
            sizeLabelDiv: '.pz-custom-content-wrapper .size-option .pz-item-title-text',
            preSizeLabelDiv: '.pz-custom-content-wrapper .size-option .pz-item-selected-size',
            sizeOuterLabelDiv: '.pz-custom-content-wrapper .size-option .pz-item-title-out-dimensions-text',
            preSizeOuterLabelDiv: '.pz-custom-content-wrapper .size-option .pz-item-title-out-dimensions-selected-text',
            sizeSlider: '.pz-customizer-section .pz-custom-content-wrapper output[name="rangeVal"]',
            apiReturnData: '#pz_platform_custom_returndata',
            mageFrameData: '#pz_magento_framedata',
            customiseUrl: 'productimize/index/option',
            defaultConfig: '#pz_magento_default_options',
            productLevel: '#pz_platform_product_level',
            isAjaxSuccess: false
        },
        vars: {
            customizerTabs: ['none', 'medtrt', 'size', 'frame', 'topmat', 'bottommat', 'liner', 'customcolor', 'sidemark'],
            customizerTabsObj: {
                'medtrt': [0, 1],
                'size': [0, 1],
                'frame': [0, 0],
                'topmat': [0, 0],
                'bottommat': [0, 0],
                'liner': [0, 0],
                'customcolor': [0, 0],
                'sidemark': [0, 0]
            }, // etc.
            customCartProperty: {},
            tabLabels: {
                "frameli": "Frame",
                "topmatli": "Top Mat",
                "bottommatli": "Bottom Mat",
                "linerli": "Liner",
                "size": "Size",
                "media": "Media",
                "treatment": "Treatment"
            },
            cartProperties:{},
            pageEdit : 1,
            tabloops : 0
        },
        _create: function () {
            var self = this;
            var default_config = $(this.options.defaultConfig).val();
            var defaultConfigJson = JSON.parse(default_config);
            var mediaDefault = defaultConfigJson.medium_default_sku;
            var product_level = $(this.options.productLevel).val();
            product_level = (product_level) ? product_level : 0;
            var treatDefault = defaultConfigJson.treatment_default_sku;
            var matsLiner = ['frame','topmat', 'bottommat', 'liner'];
            var configlevel4 = ['frame', 'liner'];

            $('body').on('change', '.pz-customizer-section .pz-custom-content-wrapper .medium-option .treatment-select-elem', self.customiseSizeOption.bind(this));

            $(document).on('click', this.options.sizeOptionDiv, function () {
                if (!self.options.isAjaxSuccess) {
                    self.customiseSizeOption();
                }
                if (self.options.isAjaxSuccess) {
                    /*active size tab
                    $(".pz-custom-items").removeClass("open");
                    $(self.options.sizeOptionDiv).parent().addClass('open');*/

                    //title append
                    if ($(self.options.preSizeLabelDiv).html() == "") {
                        if ($(self.options.sizeSlider).text()) {
                            var str = $(self.options.sizeSlider).text();
                            self.sizeTitleAppend(str);

                            var nexttab = $(this).attr('data-nexttab');
                            self.vars.customizerTabsObj.size[0] = 1;
                            self.vars.customizerTabsObj[nexttab][1] = 1;
                        }
                        $('body').on('DOMSubtreeModified', self.options.sizeSlider, function () {
                            if ($(this).text()) {
                                self.sizeTitleAppend($(this).text());
                                self.callFrameRightContent($(this).text());
                                self.checkTopMatCondition();
                                self.checkBottomMatCondition();
                                self.resetNextTabs('size');
                            }
                        });
                    }
                }
            });

            $('body').on('click', '.pz-customizer-section .pz-custom-content-wrapper .medium-option .nextcontent', function (e) {
                //presize title append
                if ($(self.options.preSizeLabelDiv).html() == "") {
                    if ($(self.options.sizeSlider).text()) {

                        //this.options.sizeOptionDiv
                        $(self.options.sizeOptionDiv).trigger('click');
                        // var str = $(self.options.sizeSlider).text();
                        // self.sizeTitleAppend(str);
                    }
                }

            });

            /*var level = 2;
            if (level == 3) {
                $(document).on('click', '#productimize_customize_button', function () {
                    setTimeout(function () {
                       // if (!self.options.isAjaxSuccess) {
                            self.customiseSizeOption();
                       // }
                        $(".pz-custom-item-body.pz-size").addClass('open');
                        $('.pz-custom-item-body.pz-size').click(false);
                    }, 6000);
                });
            }*/

            $('body').on("click", ".frameli li", function (e) {
                setTimeout(function () {
                    self.checkLinerCondition();
                }, 3000);
            });

            //topmat title append
            $(document).on("click", ".topmatli li", function (e) {
                $('.pz-design-item-list.topmatli li').removeClass('selectedFrame');
                $(this).addClass('selectedFrame');
                var selectedSku = $(this).attr('data-sku');
                var selectedColor = $(this).attr('data-color');
                var selectedTopMatText = '';
                if (selectedSku != '' && selectedColor != '') {
                    selectedTopMatText = ' /' + selectedSku + '/' + selectedColor;
                }
                $('.pz-item-selected-topmat').html(selectedTopMatText);
            });
            //ends:topmat part

            //bottom mat title append
            $(document).on("click", ".bottommatli li", function (e) {
                $('.pz-design-item-list.bottommatli li').removeClass('selectedFrame');
                $(this).addClass('selectedFrame');
                var selectedSku = $(this).attr('data-sku');
                var selectedColor = $(this).attr('data-color');
                var selectedBottomMatText = '';
                if (selectedSku != '' && selectedColor != '') {
                    selectedBottomMatText = ' /' + selectedSku + '/' + selectedColor;
                }
                $('.pz-item-selected-bottommat').html(selectedBottomMatText);
            });
            //ends:bottom-mat part

            //liner title append
            $(document).on("click", ".linerli li", function (e) {
                var selectedSku, selectedColor, selectedLinerText;
                $('.pz-design-item-list.linerli li').removeClass('selectedFrame');
                $(this).addClass('selectedFrame');
                selectedSku = $(this).attr('data-sku');
                selectedColor = $(this).attr('data-color');
                selectedLinerText = '';
                if (selectedSku != '' && selectedColor != '') {
                    selectedLinerText = ' /' + selectedSku + '/' + selectedColor;
                }
                $('.pz-item-selected-liner').html(selectedLinerText);
            });
            //ends:liner part

            $('body').on("click", ".nextcontent", function (e) {
                e.stopImmediatePropagation();
                let presentThis = $(this);
                self.tabGreenCheck(presentThis, 1);
                var tab = $(this).parents('.pz-custom-items').next().find('.pz-custom-item-header').attr('data-tab');
                if ($.inArray(tab, matsLiner) !== -1) {
                    if ($('.' + tab + 'li li').length == 1 && $('.' + tab + 'li li').hasClass('zeroth-value')) {
                        $('.' + tab + 'li li.zeroth-value').trigger('click');
                    }
                }
                if (product_level == 3 && $.inArray(tab, configlevel4) !== -1) {
                    $('.' + tab + 'li li.defaultOption').trigger('click');
                }
            });

            $('body').on("click", ".pz-custom-item-header", function (e) {
                var tab = $(this).attr('data-tab');
                let presentThis = $(this);
                self.tabGreenCheck(presentThis, 2);
                // select empty values for mat
                if ($.inArray(tab, matsLiner) !== -1) {
                    if ($('.' + tab + 'li li').length == 1 && $('.' + tab + 'li li').hasClass('zeroth-value')) {
                        $('.' + tab + 'li li.zeroth-value').trigger('click');
                    }
                }
                if (product_level == 4 && $.inArray(tab, configlevel4) !== -1) {
                    $('.' + tab + 'li li.defaultOption').trigger('click');
                }
            });
            $('body').on("change", ".pz-medium .medium-select-elem", function (e) {
                if (window.location.href.indexOf("edit") > -1) {
                    self.vars.pageEdit = 0;
                    self.vars.tabloops++;
                }
                if(self.vars.pageEdit == 0 && self.vars.tabloops <= 1)    {
                    self.editgreentick();
                }
                $(self.options.sizeLabelDiv).html(" ");
                $(self.options.preSizeLabelDiv).html("");
                $(self.options.sizeOuterLabelDiv).html("");
                $(self.options.preSizeOuterLabelDiv).html("");
                $(self.options.sizeLabelDiv).html(" Size ");

                var selectedText = $(this).find(':selected').text();
                var selectedMedia = $(this).find(':selected').val();

                var selectedTreatment = $('.pz_treatment select.treatment-select-elem').find(':selected').val();
                if (selectedMedia != '') {
                    self.vars.customCartProperty[self.vars.tabLabels['media']] = selectedText;
                    delete self.vars.customCartProperty[self.vars.tabLabels['treatment']];
                    $('.medium-treat .pz-item-selected-medtrt').html(selectedText);
                } else {
                    $('.medium-treat .pz-item-selected-medtrt').html('');
                    delete self.vars.customCartProperty[self.vars.tabLabels['media']];
                    delete self.vars.customCartProperty[self.vars.tabLabels['treatment']];
                }
                var treatArr = [];
                var treathtml = '<option value="" class="option">Select Treatment</option>';
                var returnedData = $(self.options.apiReturnData).val();
                var customizer_api_data = JSON.parse(returnedData);
                //$.each(customizer_api_data, function (key, data) {
                    //if (key == selectedMedia) {
                if (customizer_api_data && Object.keys(customizer_api_data).length > 0 && selectedMedia in customizer_api_data) {
                        var data = customizer_api_data[selectedMedia];
                        $.each(data['treatment'], function (trkey, trdata) {
                            if (trdata['display_to_customer']) {
                                treatArr.push(trkey);
                                treathtml += '<option data-sku="' + trkey + '" value="' + trkey + '" class="option">' + trdata['display_name'] + '</option>';
                            }
                        });
                        // else if(treatDefault != 'undefined') {
                        //     var html = '<option selected data-sku="'+treatDefault+'" value="'+treatDefault+'" class="option">'+treatDefault+'</option>';
                        //     $('.pz-medium select.treatment-select-elem').append(html);
                        // }
                        ///return true;
                    }
                //});
                $('.pz_treatment select.treatment-select-elem').html(treathtml);
                if((self.vars.pageEdit == 0) && (self.vars.cartProperties['treatment']!='') && self.vars.tabloops <= 1)   {
                    $(".treatment-select-elem option[value='"+self.vars.cartProperties['treatment']+"']").prop("selected", true)
                    $('.pz_treatment select.treatment-select-elem').selectric('refresh');
                    self.tabGreenCheck($('.pz_treatment select.treatment-select-elem'),1)
                    $('.pz_treatment select.treatment-select-elem').val(self.vars.cartProperties['treatment']).trigger('change');
                    self.vars.tabloops++;
                   
                }


                if (product_level != 1) {
                    if ($.inArray(treatDefault, treatArr) !== -1) {
                        $('.pz_treatment select.treatment-select-elem').val(treatDefault).trigger('change');
                    }
                    $('.pz-medium select.medium-select-elem, .pz_treatment select.treatment-select-elem').prop('disabled', true);
                }
                // if($.inArray(selectedTreatment, treatArr) !== -1) {
                //     $('.pz_treatment select.treatment-select-elem').val(selectedTreatment).trigger('change');
                // }
                if(self.vars.pageEdit == 1) {
                    self.resetNextTabs('medtrt');
                }
                $('.pz_treatment select.treatment-select-elem').selectric('refresh');
            });
            $('body').on("change", ".pz_treatment .treatment-select-elem", function () {
                var selectedText = $(this).find(':selected').text();
                var selectedVal = $(this).find(':selected').val();

                var selectedmedia = $(".medium-select-elem").find(':selected').text();
                var mediaVal = $(".medium-select-elem").find(':selected').val();

                if (selectedVal != '') {
                    //frameContent(mediaVal, selectedVal);
                    var finalText = selectedmedia + '/' + selectedText;
                    self.vars.customizerTabsObj.medtrt[0] = 1;
                    self.vars.customCartProperty[self.vars.tabLabels['treatment']] = selectedText;
                } else {
                    var finalText = selectedmedia;
                    delete self.vars.customCartProperty[self.vars.tabLabels['treatment']];
                }

                $('.medium-treat .pz-item-selected-medtrt').html(finalText);
                if(self.vars.pageEdit == 1) {
                    self.resetNextTabs('medtrt');
                }
                //setPZSelectedOptions({'name': 'treatment', 'sku' : selectedVal, 'displayName': selectedText});
            });
            $('body').on("click", ".frameli li, .linerli li, .topmatli li, .bottommatli li", function (e) {
                const data = {
                    'sku': $(this).attr('data-sku'),
                    'width': $(this).attr('data-width')
                }
                let arrayy = {"frameli": "frame", "topmatli": "topMat", "bottommatli": "bottomMat", "linerli": "liner"};
                let parentClass = $(this).parents('.pz-design-item-list').attr('dataFrom');
                var nextTab = $(this).parents('.pz-custom-items').children('.pz-custom-item-header').attr('data-nexttab');
                var clickedTab = arrayy[parentClass].toLowerCase();
                self.vars.customCartProperty[self.vars.tabLabels[parentClass]] = $(this).find('.pz-design-item-name:first').text();
                // disable click event if product level is 4
                if (product_level == 4 && $.inArray(clickedTab, configlevel4) !== -1 && e.originalEvent !== undefined) {
                    return false;
                }
                self.vars.customizerTabsObj[clickedTab][0] = 1;
                self.vars.customizerTabsObj[nextTab][1] = 1;
                if (nextTab == 'customcolor') {
                    self.vars.customizerTabsObj[nextTab][1] = 1;
                    self.vars.customizerTabsObj['sidemark'][1] = 1;
                }
                self.resetNextTabs(arrayy[parentClass], {
                    'name': arrayy[parentClass],
                    'sku': $(this).attr('data-sku'),
                    'displayName': $(this).find('.pz-design-item-name:first').text(),
                    'width': $(this).attr('data-width')
                });
                setPZSelectedOptions({
                    'name': arrayy[parentClass],
                    'sku': $(this).attr('data-sku'),
                    'displayName': $(this).find('.pz-design-item-name:first').text(),
                    'width': $(this).attr('data-width')
                });
                //callFrameData (data);

                //display outer dimensions for size
                var artworkData = self.getArtworkData();
                var outerDimensionValue = self.getOuterDimensionCalc(artworkData);
                self.sizeOuterDimensionTitleAppend(outerDimensionValue);

            });


        },
        tabGreenCheck: function (presentThis, clickfrom) {
            let customCartProperty = this.vars.customCartProperty;
            let tabLabels = this.vars.tabLabels;
            presentThis = presentThis;
            let parentItem = presentThis.parents('.pz-custom-items')
            let nextThis = parentItem.next();
            if (clickfrom == 2) {
                nextThis = parentItem;
                if (parentItem.prev().length > 0) {
                    parentItem = parentItem.prev();
                }
            }
            let tabopn = 1;
            var upcoming = '';
            let currentTab = parentItem.find('.pz-custom-item-header').attr('data-tab');
            let openTab = '';
            $.each(this.vars.customizerTabs, function (tab, value) {
                if (value == currentTab) {
                    upcoming = tab;
                }
            });
            $.each(this.vars.customizerTabs, function (tab, value) {
                if ($('[data-tab=' + value + ']').parent().length > 0 && upcoming != '' && tab <= upcoming) {
                    console.log($('[data-tab=' + value + ']').parent())
                    //if($('[data-tab=' + value + ']').parent().length > 0)   {
                        let datacheck = $('[data-tab=' + value + ']').parent().find('.nextcontent').attr('dataCheck').split(',');
                        console.log(datacheck)
                        $.each(datacheck, function (ind, value1) {
                            if (!customCartProperty[tabLabels[value1]]) {
                                tabopn = 0;
                                openTab = value;     
                                $('[data-tab=' + value + ']').parent().find('.pz-item-step-number').css('display', 'flex');
                                $('[data-tab=' + value + ']').parent().find('.pz-tick.pz-tick-success').css('display', 'none');                       
                            }   else {
                                $('[data-tab=' + value + ']').parent().find('.pz-item-step-number').css('display', 'none');
                                $('[data-tab=' + value + ']').parent().find('.pz-tick.pz-tick-success').css('display', 'flex');
                            }
                        })
                    //}
                }
                if(openTab != '')    {
                    return false;
                }
            });
            console.log(openTab)
            let valueerror1 = $('.pz-custom-items.open');
            if(openTab!='') {
                valueerror1 = $('[data-tab=' + openTab + ']').parent();
            }
            let valueerror = valueerror1.find('.pz-item-title-text').text();
            if (valueerror.toLowerCase().includes('medium')) {
                valueerror = 'Media and Treatment'
            }
            if (tabopn == 0) {
                if ($('.customred').length == 0) {
                    valueerror1.find('.nextcontent').before('<div class="customred">*Please select ' + valueerror + ' to continue</div>')
                    $('.customred').fadeOut(5000, function () {
                        $(this).remove();
                    });
                } else {
                    $('.customred').show().fadeOut(5000, function () {
                        $(this).remove();
                    });
                }
            } else {
                $('.pz-custom-items').removeClass("open");
                nextThis.addClass("open");
                parentItem.find('.pz-item-step-number').css('display', 'none');
                parentItem.find('.pz-tick.pz-tick-success').css('display', 'flex');
            }
        },
        editgreentick: function () {
            let cartProp = $('#pz_cart_properties').val();
            if(cartProp!='')    {
                this.vars.cartProperties = JSON.parse(cartProp);
                if(this.vars.cartProperties['treatment'])   {
                this.vars.customCartProperty[this.vars.tabLabels['treatment']] = this.vars.cartProperties['treatment'];
                $('.pz-custom-item-header[data-tab="medtrt"] .pz-item-header .pz-item-step-number').css('display', 'none');
                $('.pz-custom-item-header[data-tab="medtrt"] .pz-tick.pz-tick-success').css('display', 'flex');
                }
                if(this.vars.cartProperties['artwork color'] && this.vars.cartProperties['artwork color']!='')  {
                    $('.showartworktext').prop('checked', true);
                    $('.pz-text-control-wrapper').css('display','block');
                    $('.pz-text-control-wrapper').find('textarea').text(this.vars.cartProperties['artwork color'])
                    this.vars.customCartProperty['artwork color'] = this.vars.cartProperties['artwork color'];
                }
                if(this.vars.cartProperties['sidemark'] && this.vars.cartProperties['sidemark']!='')  {
                    $('.showsidemarktext').prop('checked', true);
                    $('.pz-divtext').css('display','block');
                    $('.pz-divtext').find('textarea').text(this.vars.cartProperties['sidemark'])
                    this.vars.customCartProperty['sidemark'] = this.vars.cartProperties['sidemark'];
                }
                
                if(this.vars.cartProperties['frame'])   {
                    this.vars.customCartProperty[this.vars.tabLabels['frameli']] = this.vars.cartProperties['frame'];
                    $('.pz-custom-item-header[data-tab="frame"] .pz-item-header .pz-item-step-number').css('display', 'none');
                    $('.pz-custom-item-header[data-tab="frame"] .pz-tick.pz-tick-success').css('display', 'flex');
                }
                if(this.vars.cartProperties['bottom mat'])   {
                    this.vars.customCartProperty[this.vars.tabLabels['bottommatli']] = this.vars.cartProperties['bottom mat'];
                    $('.pz-custom-item-header[data-tab="bottommat"] .pz-item-header .pz-item-step-number').css('display', 'none');
                    $('.pz-custom-item-header[data-tab="bottommat"] .pz-tick.pz-tick-success').css('display', 'flex');
                }
                if(this.vars.cartProperties['top mat'])   {
                    this.vars.customCartProperty[this.vars.tabLabels['topmatli']] = this.vars.cartProperties['top mat'];
                    $('.pz-custom-item-header[data-tab="topmat"] .pz-item-header .pz-item-step-number').css('display', 'none');
                    $('.pz-custom-item-header[data-tab="topmat"] .pz-tick.pz-tick-success').css('display', 'flex');
                }
                if(this.vars.cartProperties['liner'])   {
                    this.vars.customCartProperty[this.vars.tabLabels['linerli']] = this.vars.cartProperties['liner'];
                    $('.pz-custom-item-header[data-tab="liner"] .pz-item-header .pz-item-step-number').css('display', 'none');
                    $('.pz-custom-item-header[data-tab="liner"] .pz-tick.pz-tick-success').css('display', 'flex');
                }

            }
        },

        sizeTitleAppend: function (str) {
            var res = str.replace("×", "″w × ");
            res = ' / ' + res + "″h";

            $(this.options.sizeLabelDiv).html("");
            $(this.options.sizeLabelDiv).html("Pre-Frame Size ");
            $(this.options.preSizeLabelDiv).html("");
            $(this.options.preSizeLabelDiv).html(res);
        },


        sizeOuterDimensionTitleAppend: function (glassDimension) {
            var width, height, res;

            width = glassDimension[0];
            height = glassDimension[1];
            res = ' / ' + width + '″w × ' + height + "″h";

            $(this.options.sizeOuterLabelDiv).html("");
            $(this.options.sizeOuterLabelDiv).html("Total Outer Dimensions ");

            $(this.options.preSizeOuterLabelDiv).html("");
            $(this.options.preSizeOuterLabelDiv).html(res);
        },

        hasChangedMediaTreatment: function () {
            var defaultMedium, defaultTreatment, selectedMediumOption, selectedTreatmentOption, hasChanged = 0;
            var defaultConfig = JSON.parse($('#pz_magento_default_options').val());

            $.each(defaultConfig, function (key, data) {
                if (key == 'medium_default_sku') {
                    defaultMedium = data;
                    return false;
                }
            });

            $.each(defaultConfig, function (key, data) {
                if (key == 'treatment_default_sku') {
                    defaultTreatment = data;
                    return false;
                }
            });

            selectedMediumOption = $.trim($(this.options.mediumOptionDiv).find(".medium-select-elem option:selected").val());
            selectedTreatmentOption = $.trim($(this.options.mediumOptionDiv).find(".treatment-select-elem option:selected").val());

            if (selectedMediumOption && selectedTreatmentOption && defaultMedium != selectedMediumOption || defaultTreatment != selectedTreatmentOption) {
                hasChanged = 1;
            }
            return hasChanged;
        },

        hasChangedSizeFrame: function () {
            var defaultSize, dafaultFrame, selectedSizeOption, selectedFrameOption = '', hasChangedSF = 0;
            var defaultConfig = JSON.parse($('#pz_magento_default_options').val());
            defaultSize = "6×8";

            $.each(defaultConfig, function (key, data) {
                if (key == 'frame_default_sku') {
                    dafaultFrame = data;
                    return false;
                }
            });

            selectedSizeOption = $.trim($(this.options.sizeSlider).text());
            selectedFrameOption = $.trim($(this.options.frameOptionDiv).find('.pz-design-item.selectedFrame').attr('data-sku'));

            if (selectedSizeOption && selectedFrameOption && defaultSize != selectedSizeOption || dafaultFrame != selectedFrameOption) {
                hasChangedSF = 1;
            }

            return hasChangedSF;
        },

        customiseSizeOption: function () {
            var self = this, selectedMediumOption, selectedTreatmentOption, configLevel;
            configLevel = $(this.options.productLevel).val();
            selectedMediumOption = $(self.options.mediumOptionDiv).find(".medium-select-elem option:selected").val();
            selectedTreatmentOption = $(self.options.mediumOptionDiv).find(".treatment-select-elem option:selected").val();
            let sizeArray = '';
            if (selectedMediumOption && selectedTreatmentOption) {
                // && this.hasChangedMediaTreatment()

                $.ajax({
                    url: BASE_URL + self.options.customiseUrl,
                    type: "POST",
                    datatype: "json",
                    showLoader: true,
                    data: {
                        type: 'size',
                        selectedMedium: selectedMediumOption,
                        selectedTreatment: selectedTreatmentOption
                    },
                    success: function (response) {
                        sizeArray = response['content'];
                        $("#slider").slider({
                            range: "min",
                            steps: sizeArray,
                            change: function (e, ui) {
                                var control = $('#slider');
                                var output = control.next('output');
                                var leftPercent = $('.ui-slider-handle')[0].style.left;
                                self.vars.customCartProperty[self.vars.tabLabels['size']] = ui.stepValue;
                                leftPercent = leftPercent.replace('%', '');
                                leftPercent = parseInt(leftPercent);
                                var dis = leftPercent * 0.06;
                                leftPercent = leftPercent - dis;

                                output.css('left', leftPercent + '%').css('position', 'absolute').text(ui.stepValue);
                                // output.css('left', $('.ui-slider-handle')[0].style.left).css('position', 'absolute').text(ui.stepValue);
                                $('.rangeleft').html('<span>' + sizeArray[0] + '</span>(Min)');
                                $('.rangeright').html('<span>' + sizeArray[sizeArray.length - 1] + '</span>(Max)');
                            },
                            create: function (e, ui) {
                                var control = $('#slider');
                                var output = control.next('output');
                                output.css('left', $('.ui-slider-handle')[0].style.left).css('position', 'absolute').text(ui.stepValue);
                                $('.rangeleft').html('<span>' + sizeArray[0] + '</span>(Min)');
                                $('.rangeright').html('<span>' + sizeArray[sizeArray.length - 1] + '</span>(Max)');
                            }
                        });
                        $('#slider').append('<div class="leftBubble"></div><div class="rightBubble"><div>')

                        self.options.isAjaxSuccess = true;
                        if (selectedTreatmentOption) {
                            self.callFrameRightContent(sizeArray[0]);
                            self.checkTopMatCondition();
                            self.checkBottomMatCondition();
                        }
                        // self.callMatRightContent(matArray);
                        //self.callMatBotRightContent(matArray);
                        if (configLevel >= 3) {
                            $('#slider').slider({disabled: true});
                        }
                    },
                    complete: function (xhr, status) {
                        if ($(".ui-slider-range").length > 0) {
                            $('.rangeleft').html('<span>' + sizeArray[0] + '</span>(Min)');
                            $('.rangeright').html('<span>' + sizeArray[sizeArray.length - 1] + '</span>(Max)');
                            var control = $('#slider');
                            var output = control.next('output');

                            if(self.vars.pageEdit == 0 && self.vars.cartProperties['size'])   {
                                // let sizeVal = self.vars.cartProperties['size'].replace('X','x×');
                                // console.log(sizeArray)
                                // console.log(sizeVal , '16×21')
                                // if(parseInt(sizeVal) == '16×21')  {
                                //     console.log('samemee')
                                // }
                                // console.log(sizeArray.indexOf('16×21'))        
                                // var found = false;
                                // for (var i = 0; i < sizeArray.length && !found; i++) {
                                //     console.log(sizeArray[i].trim().length ,sizeVal.trim().length)
                                // if (sizeArray[i].includes(sizeVal)) {
                                //     found = true;
                                //     console.log('foffofuntt')
                                //     break;
                                // }
                                // }
                                
                                // const myName = sizeArray.filter(name => name.includes(sizeVal));
                                // console.log(myName);
                                let sizeVal = self.vars.cartProperties['size']
                                console.log(sizeVal)
                                console.log(sizeArray.indexOf(sizeVal))
                                let leftPosi = (100/sizeArray.length)*sizeArray.indexOf(sizeVal);
                                self.vars.customCartProperty[self.vars.tabLabels['size']] = sizeVal;
                                output.css('left', leftPosi+'%').css('position', 'absolute').text(sizeVal);
                                $('.ui-slider-handle').css('left', leftPosi+'%')
                                var str = $('output[name="rangeVal"]').text();
                                self.sizeTitleAppend(str);
                                self.vars.tabloops++;
                            }   else {
                                self.vars.customCartProperty[self.vars.tabLabels['size']] = sizeArray[0];
                                output.css('left', '0%').css('position', 'absolute').text(sizeArray[0]);
                                $('.ui-slider-handle').css('left', '0%')
                            }
                            
                            
                            
                        }


                        //callTreatmentData({value: 1});

                    },
                    error: function (error) {
                        self.options.isAjaxSuccess = false;
                    }
                });
            }
        },

        checkTopMatCondition: function () {
            var configLevel, isDefaultTopMat = 0, requireTopMatForTreatment, selectedMediumOption,
                selectedTreatmentOption, returnedData, defaultConfig;

            configLevel = $('#pz_platform_product_level').val();
            selectedMediumOption = $(this.options.mediumOptionDiv).find(".medium-select-elem option:selected").val();
            selectedTreatmentOption = $(this.options.mediumOptionDiv).find(".treatment-select-elem option:selected").val();

            returnedData = JSON.parse($(this.options.apiReturnData).val());
            selectedMediumOption = $(this.options.mediumOptionDiv).find(".medium-select-elem option:selected").val();
            selectedTreatmentOption = $(this.options.mediumOptionDiv).find(".treatment-select-elem option:selected").val();
            requireTopMatForTreatment = parseFloat(returnedData[selectedMediumOption]['treatment'][selectedTreatmentOption]['requires_top_mat']);

            defaultConfig = JSON.parse($('#pz_magento_default_options').val());
            $.each(defaultConfig, function (key, data) {
                if (key == 'top_mat_default_sku' && data) {
                    isDefaultTopMat = 1;
                    return false;
                }
            });

            if (configLevel <= 4) {
                if (selectedMediumOption && selectedTreatmentOption) {
                    if (this.hasChangedMediaTreatment()) {
                        if (requireTopMatForTreatment) {
                            this.getFirstMatCondition('topmat');
                        } else {
                            //disable topmat
                            this.callMatRightContent([], 'topmat');
                        }
                    } else {
                        if (isDefaultTopMat) {
                            this.getFirstMatCondition('topmat');
                        } else {
                            //disable topmat
                            this.callMatRightContent([], 'topmat');
                        }
                    }
                } else {
                    //disable topmat
                    this.callMatRightContent([], 'topmat');
                }
            }
        },

        checkBottomMatCondition: function () {
            var configLevel, isDefaultBottomMat = 0, requireBottomMatForTreatment, selectedMediumOption,
                selectedTreatmentOption, returnedData, defaultConfig;

            configLevel = $('#pz_platform_product_level').val();
            selectedMediumOption = $(this.options.mediumOptionDiv).find(".medium-select-elem option:selected").val();
            selectedTreatmentOption = $(this.options.mediumOptionDiv).find(".treatment-select-elem option:selected").val();

            returnedData = JSON.parse($(this.options.apiReturnData).val());
            selectedMediumOption = $(this.options.mediumOptionDiv).find(".medium-select-elem option:selected").val();
            selectedTreatmentOption = $(this.options.mediumOptionDiv).find(".treatment-select-elem option:selected").val();
            requireBottomMatForTreatment = parseFloat(returnedData[selectedMediumOption]['treatment'][selectedTreatmentOption]['requires_bottom_mat']);

            defaultConfig = JSON.parse($('#pz_magento_default_options').val());
            $.each(defaultConfig, function (key, data) {
                if (key == 'bottom_mat_default_sku' && data) {
                    isDefaultBottomMat = 1;
                    return false;
                }
            });

            if (configLevel <= 4) {
                if (selectedMediumOption && selectedTreatmentOption) {
                    if (this.hasChangedMediaTreatment()) {
                        if (requireBottomMatForTreatment) {
                            this.getFirstMatCondition('bottommat');
                        } else {
                            //disable bottommat
                            this.callMatRightContent([], 'bottommat');
                        }
                    } else {
                        if (isDefaultBottomMat) {
                            this.getFirstMatCondition('bottommat');
                        } else {
                            //disable bottommat
                            this.callMatRightContent([], 'bottommat');
                        }
                    }
                } else {
                    //disable bottommat
                    this.callMatRightContent([], 'bottommat');
                }
            }
        },

        getFirstMatCondition: function (matTypeOption) {
            var isDefaultMat, isDefaultTopMat = 0, isDefaultBottomMat = 0, glassDimention, artworkData, width, height,
                defaultConfig;

            defaultConfig = JSON.parse($('#pz_magento_default_options').val());
            artworkData = this.getArtworkData();
            glassDimention = getGlassDimention(artworkData);
            width = glassDimention[0];
            height = glassDimention[1];
            $.each(defaultConfig, function (key, data) {
                if (key == 'top_mat_default_sku' && data) {
                    isDefaultTopMat = 1;
                    return false;
                }
            });

            $.each(defaultConfig, function (key, data) {
                if (key == 'bottom_mat_default_sku' && data) {
                    isDefaultBottomMat = 1;
                    return false;
                }
            });


            isDefaultMat = (matTypeOption == 'topmat') ? isDefaultTopMat : isDefaultBottomMat;

            if (width > 40 && height > 60) {
                //display default mat with no op to select
                this.getMatArray('default', matTypeOption);
            } else {
                if (this.hasChangedMediaTreatment() || this.hasChangedSizeFrame()) {
                    this.getSecondMatCondition(matTypeOption);
                } else {
                    if (isDefaultMat) {
                        //display default mat
                        this.getMatArray('default', matTypeOption);
                    } else {
                        this.getSecondMatCondition(matTypeOption);
                    }
                }
            }

        },

        getSecondMatCondition: function (matTypeOption) {
            var glassDimention, width, height, artworkData;

            artworkData = this.getArtworkData();
            glassDimention = getGlassDimention(artworkData);
            width = glassDimention[0];
            height = glassDimention[1];

            if (width > 32 && height > 40) {
                this.getMatArray('oversized', matTypeOption);
            } else {
                this.getMatArray('standard', matTypeOption);
            }
        },

        getArtworkData: function () {
            var selectedSizeOption = $.trim($(this.options.sizeSlider).text()), artworkData = {}, selectedSize,
                selectedFrameSku, returnedFrameData, frameWidth = 1, frameType = 'no-type';

            if (selectedSizeOption.indexOf('x') != -1) {
                selectedSize = selectedSizeOption.split('x');
            } else {
                selectedSize = selectedSizeOption.split('\u00d7');
            }
            selectedFrameSku = $(this.options.frameOptionDiv).find('.pz-design-item.selectedFrame').attr('data-sku');
            returnedFrameData = JSON.parse($(this.options.mageFrameData).val());

            if (selectedFrameSku && returnedFrameData[selectedFrameSku]) {
                frameWidth = returnedFrameData[selectedFrameSku]['m_frame_width'];
                frameType = returnedFrameData[selectedFrameSku]['m_frame_type'];
            }
            // var linerData = [
            //     {
            //         m_sku: 'L0023',
            //         m_name: 'Liner L0023',
            //         m_liner_type: 'liner',
            //         m_liner_depth: 1.375,
            //         m_liner_rabbet_depth: 0.375,
            //         m_color_liner: 'Antique Gold test3',
            //         m_color_family: 'Gold'
            //     }, {
            //         m_sku: 'L0004',
            //         m_name: 'Liner L0004',
            //         m_liner_type: 'liner',
            //         m_liner_depth: 0.56,
            //         m_liner_rabbet_depth: 0.25,
            //         m_color_liner: 'Antique Gold test3',
            //         m_color_family: 'Gold test3'
            //     }, {
            //         m_sku: 'L0013',
            //         m_name: 'Liner L0013',
            //         m_liner_type: 'liner',
            //         m_liner_depth: 0.68,
            //         m_liner_rabbet_depth: 0.25,
            //         m_color_liner: 'Antique Gold test3',
            //         m_color_family: 'Gold test3'
            //     }
            // ];
            //
            // var selectedLinerSku = $(this.options.linerOptionDiv).find('.pz-design-item.selectedFrame').attr('data-sku');
            // if (selectedLinerSku && linerData[selectedLinerSku]) {
            //     var linerWidth = linerData[selectedLinerSku]['m_frame_width'];
            // }


            artworkData.outerWidth = selectedSize[0];
            artworkData.outerHeight = selectedSize[1];
            artworkData.frameWidth = frameWidth;
            artworkData.linerWidth = 0;
            artworkData.frameType = frameType;
            return artworkData;
        },

        getOuterDimensionCalc: function (artworkData) {
            var glassWidth = artworkData.outerWidth - artworkData.frameWidth * 2 - artworkData.linerWidth * 2;

            if (artworkData.frameType.toLowerCase() == "standard") {
                glassWidth += 0.5;
            } else if (artworkData.frameType.toLowerCase() == "floater") {
                glassWidth -= 0.25;
            }

            if (artworkData.linerWidth) {
                glassWidth += 0.5;
            }

            var glassHeight = artworkData.outerHeight - artworkData.frameWidth * 2 - artworkData.linerWidth * 2;

            if (artworkData.frameType.toLowerCase() == "standard") {
                glassHeight += 0.5;
            } else if (artworkData.frameType.toLowerCase() == "floater") {
                glassHeight -= 0.25;
            }

            if (artworkData.linerWidth) {
                glassHeight += 0.5;
            }
            return [glassWidth, glassHeight];
        },

        getMatArray: function (type, matTypeOption) {
            type = type.trim();
            var i = 0, matArray = [], defaultConfig, defaultMatSku;
            var matData = [
                {
                    m_sku: 'B97',
                    m_name: 'Mat B97',
                    m_status: 1,
                    m_mat_type: "oversized",
                    m_fabric_cost_per_lin_ft: 0,
                    m_specialty_note: '',
                    m_color_mat: 'Bright White',
                    m_color_family: 'White',
                    m_filter_thickness: 'Single',
                    m_filter_type: 'standard',
                    m_filter_size: 'standard'
                }, {
                    m_sku: 'B8-97',
                    m_name: 'Mat B8-97',
                    m_status: 1,
                    m_mat_type: "standard",
                    m_fabric_cost_per_lin_ft: 0,
                    m_specialty_note: '',
                    m_color_mat: 'Bright White',
                    m_color_family: 'White',
                    m_filter_thickness: 'Single',
                    m_filter_type: 'standard',
                    m_filter_size: 'oversized',

                }, {
                    m_sku: 'B98',
                    m_name: 'Mat B98',
                    m_status: 1,
                    m_mat_type: "standard",
                    m_fabric_cost_per_lin_ft: 0,
                    m_specialty_note: '',
                    m_color_mat: 'Off White',
                    m_color_family: 'White',
                    m_filter_thickness: 'Single',
                    m_filter_type: 'standard',
                    m_filter_size: 'standard',
                }

            ];
            defaultConfig = JSON.parse($('#pz_magento_default_options').val());

            $.each(defaultConfig, function (key, data) {
                if (key == 'top_mat_default_sku') {
                    defaultMatSku = data;
                    return false;
                }
            });

            $.each(matData, function (key, data) {
                var matType = data['m_mat_type'].trim();
                if (matType == type) {
                    matArray[i] = data;
                    i++;
                }

                if (type == 'default' && defaultMatSku == data['m_sku']) {
                    matArray[i] = data;
                    i++;
                }

            });
            this.callMatRightContent(matArray, matTypeOption);
        },

        checkLinerCondition: function () {
            var configLevel, isDefaultLiner = 0, requireLinerForTreatment, frameType, selectedMediumOption,
                selectedTreatmentOption, selectedFrameSku, returnedFrameData, returnedData, defaultConfig;

            configLevel = $('#pz_platform_product_level').val();
            returnedFrameData = JSON.parse($(this.options.mageFrameData).val());
            selectedFrameSku = $(this.options.frameOptionDiv).find('.pz-design-item.selectedFrame').attr('data-sku');
            if (selectedFrameSku && returnedFrameData[selectedFrameSku]) {
                frameType = returnedFrameData[selectedFrameSku]['m_frame_type'];
                frameType = frameType.toLowerCase();
            }

            returnedData = JSON.parse($(this.options.apiReturnData).val());
            selectedMediumOption = $(this.options.mediumOptionDiv).find(".medium-select-elem option:selected").val();
            selectedTreatmentOption = $(this.options.mediumOptionDiv).find(".treatment-select-elem option:selected").val();
            requireLinerForTreatment = parseFloat(returnedData[selectedMediumOption]['treatment'][selectedTreatmentOption]['requires_liner']);

            defaultConfig = JSON.parse($('#pz_magento_default_options').val());
            $.each(defaultConfig, function (key, data) {
                if (key == 'liner_default_sku' && data) {
                    isDefaultLiner = 1;
                    return false;
                }
            });

            if (configLevel < 4) {
                if (selectedMediumOption && selectedTreatmentOption && selectedFrameSku != "No Frame") {
                    if (this.hasChangedMediaTreatment()) {
                        if (requireLinerForTreatment && frameType == 'standard') { //console.log("change pass");
                            this.getLinerArray('custom');
                        } else { //console.log("change fail");
                            //disable liner
                            this.callLinerRightContent([]);
                        }
                    } else { //console.log("nochange");
                        if (isDefaultLiner) { //console.log("isDefaultLiner");
                            if (this.hasChangedSizeFrame()) { //console.log("size change");
                                console.log(frameType);
                                if (frameType == 'standard') { //console.log(" select");
                                    this.getLinerArray('custom');
                                } else { //console.log("no size change");
                                    //disable liner
                                    this.callLinerRightContent([]);
                                }
                            } else { //console.log("no size change");
                                //show default liner
                                this.getLinerArray('default');
                            }
                        } else { //console.log("no isDefaultLiner");
                            //disable liner
                            this.callLinerRightContent([]);
                        }
                    }
                } else { //console.log("undefined");
                    //disable liner
                    this.callLinerRightContent([]);
                }
            } else { //console.log("undefined");
                //disable liner
                this.callLinerRightContent([]);
            }
        },

        getLinerArray: function (type) {

            var type, linerData, selectedFrameSku, returnedFrameData, returnedData, selectedMedia, selectedTreatment,
                minRabbetDepth, frameRabbetDepth = '', i = 0, linerArray = [], linerRabbetDepthCheck, linerCheck,
                defaultLinerSku, defaultConfig;

            type = type.trim();
            linerData = [
                {
                    m_sku: 'L0023',
                    m_name: 'Liner L0023',
                    m_liner_type: 'liner',
                    m_liner_depth: 1.375,
                    m_liner_rabbet_depth: 0.375,
                    m_color_liner: 'Antique Gold test3',
                    m_color_family: 'Gold'
                }, {
                    m_sku: 'L0004',
                    m_name: 'Liner L0004',
                    m_liner_type: 'liner',
                    m_liner_depth: 0.56,
                    m_liner_rabbet_depth: 0.25,
                    m_color_liner: 'Antique Gold test3',
                    m_color_family: 'Gold test3'
                }, {
                    m_sku: 'L0013',
                    m_name: 'Liner L0013',
                    m_liner_type: 'liner',
                    m_liner_depth: 0.68,
                    m_liner_rabbet_depth: 0.25,
                    m_color_liner: 'Antique Gold test3',
                    m_color_family: 'Gold test3'
                }
            ];
            selectedFrameSku = $(this.options.frameOptionDiv).find('.pz-design-item.selectedFrame').attr('data-sku');
            returnedFrameData = JSON.parse($(this.options.mageFrameData).val());

            if (selectedFrameSku && returnedFrameData[selectedFrameSku]) {
                //do
                frameRabbetDepth = returnedFrameData[selectedFrameSku]['m_frame_rabbet_depth'];
            }


            returnedData = JSON.parse($(this.options.apiReturnData).val());
            selectedMedia = $(this.options.mediumOptionDiv).find(".medium-select-elem option:selected").val();
            selectedTreatment = $(this.options.mediumOptionDiv).find(".treatment-select-elem option:selected").val();
            minRabbetDepth = parseFloat(returnedData[selectedMedia]['treatment'][selectedTreatment]['min_rabbet_depth']);
            linerRabbetDepthCheck = parseFloat(returnedData[selectedMedia]['treatment'][selectedTreatment]['liner_rabbet_depth_check']);
            console.log(frameRabbetDepth);
            console.log(minRabbetDepth);
            console.log("linerRabbetDepthCheck");
            console.log(linerRabbetDepthCheck);

            defaultConfig = JSON.parse($('#pz_magento_default_options').val());
            $.each(defaultConfig, function (key, data) {
                if (key == 'liner_default_sku') {
                    defaultLinerSku = data;
                    return false;
                }
            });


            $.each(linerData, function (key, data) {
                var linerHeight = data['m_liner_depth'];
                var linerRabbetDepth = data['m_liner_rabbet_depth'];

                linerCheck = 0;

                if (linerRabbetDepthCheck) {
                    if ((linerRabbetDepth >= minRabbetDepth)) {
                        linerCheck = 1;
                    }
                } else {
                    linerCheck = 1;
                }

                if ((linerHeight <= frameRabbetDepth) && (linerCheck) && ((linerHeight - linerRabbetDepth + minRabbetDepth) <= frameRabbetDepth)) {
                    linerArray[i] = data;
                    i++;
                }

                if (type == 'default' && defaultLinerSku == data['m_sku']) {
                    linerArray[i] = data;
                    i++;
                }

            });

            console.log(linerArray);
            this.callLinerRightContent(linerArray);
        },

        callFrameRightContent: function (size) {
            var self = this, selectedMedia, selectedTreatment, returnedData, returnedFrameData;
            var framedetail = '', locSearchVal = '', colorSearchVal = [], widthSearchVal = '', frameColorFilter = {},
                colorSubVal = [], typeSearchVal = '', framesizefilter = {}, frametypefilter = {};
            selectedMedia = $(self.options.mediumOptionDiv).find(".medium-select-elem option:selected").val();
            selectedTreatment = $(self.options.mediumOptionDiv).find(".treatment-select-elem option:selected").val();
            var product_level = $(this.options.productLevel).val();
            var default_config = $(this.options.defaultConfig).val();
            var defaultConfigJson = JSON.parse(default_config);
            var frameDefault = defaultConfigJson.frame_default_sku;
            var defaultTreatment = defaultConfigJson.treatment_default_sku;
            ;
            returnedData = $(self.options.apiReturnData).val();
            returnedFrameData = $(self.options.mageFrameData).val();
            var artworkData = {};
            if (size.indexOf('x') != -1) {
                var selectedSize = size.split('x');
            } else {
                var selectedSize = size.split('\u00d7');
            }
            $('.pz-item-selected-frame').html('');
            console.log(selectedSize);
            returnedData = JSON.parse(returnedData);
            returnedFrameData = JSON.parse(returnedFrameData);
            console.log(returnedData);
            console.log(returnedFrameData);
            framedetail = returnedFrameData;
            var frameTypesAllowed = [];
            console.log(selectedTreatment);
            //if(returnedData[selectedMedia]['treatment'][selectedTreatment].hasOwnProperty('frames')) {
            let noframeShow = 0;
            $.each(returnedData[selectedMedia]['treatment'][selectedTreatment]['frames'], function (framekey, framedata) {
                frameTypesAllowed.push(framedata);
                if(framedata.toLowerCase().includes('unframed'))   {
                    noframeShow = 1;
                }
            });
            //}

            //frameTypesAllowed = ["Standard"];

            var selectedFrameText = '';
            var selected = '';
            if(self.vars.pageEdit == 0 && self.vars.cartProperties['frame'])   {
                 if(self.vars.cartProperties['frame'] ==  'No Frame')    {
                    selected = 'selectedFrame';
                    self.vars.customCartProperty[self.vars.tabLabels['frameli']] = 'No Frame';
                }
                self.vars.tabloops++;
            }            
            var mediaframehtml = '<li class="pz-design-item zeroth-value ' + selected + '" data-tab="" data-color="" data-sku="No Frame" data-width="" data-color-frame="" data-type="">' +
                '<div class="pz-design-item-content">' +
                '<div class="pz-design-item-img" style="background: url(&quot;https://devcloud.productimize.com/v3/promizenode/./assets/images/61/OptionImages/StandardImage/IMAGE-1608031183157.PNG&quot;); width: 50px; height: 50px;"></div>' +
                '<div class="pz-design-item-name"> No Frame </div>' +
                '</div>' +
                '</li>';
            let widthLi = '';
            let typeLi = '';
            let colorlist = '';
            if(noframeShow == 0)    {
                mediaframehtml = '';
            
                let widthdata = [];
                widthLi = '<li class="pz-design-item widthli" id="widthli0">Select Width</li>';
                typeLi = '<li class="pz-design-item typeli" id="typeli0">Select Type</li>';
                colorlist = '<div class="clearcolor">CLEAR ALL</div><div class="maincolor"><input type="checkbox" id="All Color" class="allcolorinput" name="All Color" value="All Color" /><label for="All Color"> All Color</label></div>';
                let typearray = [];
                $.each(returnedFrameData, function (framekey, framedata) {
                    if ($.inArray(framedata['m_frame_type'], frameTypesAllowed) !== -1) {
                        var minRabbetDepth = parseFloat(returnedData[selectedMedia]['treatment'][selectedTreatment]['min_rabbet_depth']);
                        artworkData.outerWidth = selectedSize[0];
                        artworkData.outerHeight = selectedSize[1];
                        artworkData.frameWidth = framedata['m_frame_width'];
                        artworkData.linerWidth = 0;
                        artworkData.frameType = framedata['m_frame_type'];
                        var glassDimention = getGlassDimention(artworkData); console.log(glassDimention);
                        var glassSize = glassDimention[0] * glassDimention[1];
                        //framedata['m_max_outer_size'] >= glassSize
                        console.log(framedata['m_frame_rabbet_depth'], " ",  minRabbetDepth,  " ", framedata['m_max_outer_size'],  " ", glassSize);
                        if (parseFloat(framedata['m_frame_rabbet_depth']) >= minRabbetDepth && framedata['m_max_outer_size'] >= glassSize) {
                            if ($.inArray(framedata['m_frame_width'], widthdata) == -1) {
                                console.log(framedata)
                                widthdata.push(framedata['m_frame_width']);
                                let dataKey = framedata['m_frame_width'].replace(/\./g, "") + ',' + framedata['m_color_family'] + ',' + framedata['m_frame_type'];
                                widthLi += '<li class="pz-design-item widthli" dataKey="' + dataKey + '" id="widthli' + framedata['m_frame_width'].replace(/\./g, "") + '">' + framedata['m_frame_width'] + '</li>';

                                if ($.inArray(framedata['m_frame_type'].trim(), typearray) == -1) {
                                    typearray.push(framedata['m_frame_type']);
                                }


                                //typeLi += '<li class="pz-design-item typeli" id="typeli'+framedata['m_frame_type']+'">'+framedata['m_frame_type']+'</li>';
                            }

                            if (framedata['m_color_family']) {
                                if (!frameColorFilter[framedata['m_color_family']]) {
                                    frameColorFilter[framedata['m_color_family']] = [];
                                    framesizefilter[framedata['m_color_family']] = [];
                                    frametypefilter[framedata['m_color_family']] = [];
                                }
                                if ($.inArray(framedata['m_color_frame'].trim(), frameColorFilter[framedata['m_color_family']]) == -1) {
                                    frameColorFilter[framedata['m_color_family']].push(framedata['m_color_frame'].trim());
                                    framesizefilter[framedata['m_color_family']].push(framedata['m_frame_width'].replace(/\./g, ""));
                                    frametypefilter[framedata['m_color_family']].push(framedata['m_frame_type'].replace(/\./g, ""));
                                }
                            }

                            var selected = '';
                            if (product_level == 4) {
                                if (frameDefault == framedata['m_sku']) { //&& selectedTreatment == defaultTreatment
                                    selected = 'defaultOption';
                                }
                            }
                            if(self.vars.pageEdit == 0 && self.vars.cartProperties['frame'])   {
                                if(self.vars.cartProperties['frame'] ==  framedata['m_sku'])    {
                                    selected = 'selectedFrame';
                                    self.vars.customCartProperty[self.vars.tabLabels['frameli']] = framedata['m_sku'];
                                    if(framedata['m_sku'] != '' && framedata['m_color_family'] != '') {
                                        $('.pz-item-selected-frame').html(framedata['m_sku']+'/'+framedata['m_color_family']);
                                        $('.pz-item-selected-frame').attr('data-sku', framedata['m_sku']);
                                    }
                                }
                            }
                            var framePath = 'https://devcloud.productimize.com/productimizedemo/perficientJS/images/frames/renderer_';
                            var cornerImage = framePath + framedata['m_sku'] + '_corner1.PNG';
                            mediaframehtml += '<li class="pz-design-item ' + selected + '" data-color="' + framedata['m_color_family'] + '" data-sku="' + framedata['m_sku'] + '" data-width="' + framedata['m_frame_width'] + '" data-color-frame="' + framedata['m_color_frame'] + '" data-type="' + framedata['m_frame_type'] + '">' +
                                '<div class="pz-design-item-content">' +
                                '<div class="pz-design-item-img" style="background: url(' + cornerImage + '); width: 50px; height: 50px;"></div>' +
                                '<div class="pz-design-item-name">' + framedata['m_sku'] + ' </div>' +
                                '<div class="pz-design-item-name">' + framedata['m_frame_width'] + '"</div>' +
                                '</div>' +
                                '</li>';
                        }
                    }
                });

                $.each(frameColorFilter, function (frameColorFilterkey, frameColorFilterdata) {
                    // console.log(framesizefilter[frameColorFilterkey])
                    // console.log(frametypefilter[frameColorFilterkey])
                    var joinkeys = framesizefilter[frameColorFilterkey].concat(frametypefilter[frameColorFilterkey]).concat(frameColorFilterkey.replace(/\s/g, ''));
                    console.log(joinkeys)
                    colorlist += '<div class="maincolor"><div dataKey="' + joinkeys + '" class="checkmainarea" id="maincolor' + frameColorFilterkey.replace(/\s/g, '').toLowerCase() + '"><input type="checkbox" class="maincolorinput" id="' + frameColorFilterkey + '" name="' + frameColorFilterkey + '" value="' + frameColorFilterkey + '"><label for="' + frameColorFilterkey + '"> ' + frameColorFilterkey + '</label></div><div class="subcolor">';
                    $.each(frameColorFilterdata, function (key, val) {
                        colorlist += '<div class="checkarea" id="subcolor' + val.replace(/\s/g, '').toLowerCase() + '"><input type="checkbox" class="subcolorinput" id="' + val + '" name="' + val + '" value="' + val + '"><label for="' + val + '"> ' + val + '</label></div>';
                    })
                    colorlist += '</div></div>';
                });

                $.each(typearray, function (typekey, typeval) {
                    typeLi += '<li class="pz-design-item typeli" id="typeli' + typeval + '">' + typeval + '</li>';
                });
               
                console.log($('.frameli').find('li').length);
            }
            $('.frameli').html(mediaframehtml);
            $('.pz-frame .colorlist').html(colorlist);
            $('.pz-optionwidthsearch ul').html(widthLi);
            $('.pz-frame').find('.pz-optiontypesearch ul').html(typeLi);
            console.log($('.frameli').find('li').length);
            //$('.frameli').owlCarousel('destroy');


            

            if($('.frameli').find('li').length > 0) {
                $('.frameli').owlCarousel('destroy');
                $('.frameli').owlCarousel({
                    loop: false,
                    margin: 10,
                    nav: true,
                    navText: [
            '<i class="fa fa-chevron-left" aria-hidden="true"></i>',
            '<i class="fa fa-chevron-right" aria-hidden="true"></i>'
        ],
                    responsive: {
                        0: {
                            items: 1
                        },
                        600: {
                            items: 3
                        },
                        1000: {
                            items: 5
                        }
                    }
                });
        }
            this.checkLinerCondition();

        },
        callLinerRightContent: function (linerArray) {
            var self = this, selectedMedia, selectedTreatment, returnedData, returnedFrameData;
            var framedetail = '', locSearchVal = '', colorSearchVal = [], widthSearchVal = '', frameColorFilter = {},
                colorSubVal = [], typeSearchVal = '', framesizefilter = {}, frametypefilter = {};
            selectedMedia = $(self.options.mediumOptionDiv).find(".medium-select-elem option:selected").val();
            selectedTreatment = $(self.options.mediumOptionDiv).find(".treatment-select-elem option:selected").val();
            var default_config = $(this.options.defaultConfig).val();
            var defaultConfigJson = JSON.parse(default_config);
            var linerDefault = defaultConfigJson.liner_default_sku;
            var product_level = $(this.options.productLevel).val();
            returnedData = $(self.options.apiReturnData).val();
            returnedFrameData = $(self.options.mageFrameData).val();
            var artworkData = {};
            artworkData.outerWidth = "24";
            artworkData.outerHeight = "32";
            artworkData.frameWidth = "3.75";
            artworkData.linerWidth = 0;
            artworkData.frameType = "Standard";
            var glassDimention = getGlassDimention(artworkData)
            returnedData = JSON.parse(returnedData);
            returnedFrameData = linerArray;
            var frameTypesAllowed = [];
            $.each(returnedData[selectedMedia]['treatment'][selectedTreatment]['frames'], function (framekey, framedata) {
                frameTypesAllowed.push(framekey);
            });
            frameTypesAllowed = ["liner"];
            var selectedFrameText = '';
            var selected = '';
            if(self.vars.pageEdit == 0 && self.vars.cartProperties['liner'])   {
                console.log(self.vars.cartProperties['liner'])
                if(self.vars.cartProperties['liner'] ==  'No Liner')    {
                    selected = 'selectedFrame';
                    self.vars.customCartProperty[self.vars.tabLabels['linerli']] = 'No Liner';
                }
                self.vars.tabloops++;
            }
            var mediaframehtml = '<li class="pz-design-item no-liner zeroth-value '+selected+'" data-color="" data-sku="No Liner" data-width="" data-color-frame="" data-type="">' +
                '<div class="pz-design-item-content">' +
                '<div class="pz-design-item-img" style="background: url(&quot;https://devcloud.productimize.com/v3/promizenode/./assets/images/61/OptionImages/StandardImage/IMAGE-1608031183157.PNG&quot;); width: 50px; height: 50px;"></div>' +
                '<div class="pz-design-item-name">No Liner</div>' +
                '</div>' +
                '</li>';
            let widthdata = [];
            let widthLi = '<li class="pz-design-item widthli" id="widthli0">Select Width</li>';
            let colorlist = '<div class="clearcolor">CLEAR ALL</div><div class="maincolor"><input type="checkbox" id="All Color" class="allcolorinput" name="All Color" value="All Color" /><label for="All Color"> All Color</label></div>';
            var i = 1;
            $('.pz-item-selected-liner').html('');
            var requiresLiner = returnedData[selectedMedia]['treatment'][selectedTreatment]['requires_liner'];
            if (parseInt(requiresLiner)) {
                mediaframehtml = '';
                $.each(returnedFrameData, function (framekey, framedata) {
                    console.log(framedata);
                    if ($.inArray(framedata['m_liner_type'], frameTypesAllowed) !== -1) {
                        //if(parseFloat(framedata['m_liner_rabbet_depth']) >= parseFloat(returnedData[selectedMedia]['treatment'][selectedTreatment]['min_rabbet_depth'])) {
                        // if($.inArray( framedata['m_liner_width'], widthdata ) == -1)   {
                        //     console.log(framedata)
                        //     widthdata.push(framedata['m_liner_width']);
                        //     let dataKey = framedata['m_liner_width'].replace(/\./g, "")+','+framedata['m_color_family']+','+framedata['m_liner_type'];
                        //     widthLi += '<li class="pz-design-item widthli" dataKey="'+dataKey+'" id="widthli'+framedata['m_liner_width'].replace(/\./g, "")+'">'+framedata['m_liner_width']+'</li>';
                        // }
                        if (framedata['m_color_family']) {
                            if (!frameColorFilter[framedata['m_color_family']]) {
                                frameColorFilter[framedata['m_color_family']] = [];
                            }
                            if ($.inArray(framedata['m_color_liner'].trim(), frameColorFilter[framedata['m_color_family']]) == -1) {
                                frameColorFilter[framedata['m_color_family']].push(framedata['m_color_liner'].trim());
                            }
                        }
                        selected = '';
                        if (product_level == 4) {
                            if (linerDefault == framedata['m_sku']) { //&& selectedTreatment == defaultTreatment
                                selected = 'defaultOption';
                            }
                        }
                        if(self.vars.pageEdit == 0 && self.vars.cartProperties['liner'])   {
                            if(self.vars.cartProperties['liner'] ==  framedata['m_sku'])    {
                                selected = 'selectedFrame';
                                self.vars.customCartProperty[self.vars.tabLabels['linerli']] = framedata['m_sku'];
                                if(framedata['m_sku'] != '' && framedata['m_color_family'] != '') {
                                    $('.pz-item-selected-liner').html(framedata['m_sku']+'/'+framedata['m_color_family']);
                                    $('.pz-item-selected-liner').attr('data-sku', framedata['m_sku']);
                                }
                            }
                        }
                        var linerPath = 'https://devcloud.productimize.com/productimizedemo/perficientJS/images/liner/renderer_';

                        var linerThumbPath = linerPath + framedata['m_sku'] + '_corner1.png';

                        mediaframehtml += '<li class="pz-design-item ' + selected + '" data-color="' + framedata['m_color_family'] + '" data-sku="' + framedata['m_sku'] + '" data-width="' + framedata['m_liner_width'] + '" data-color-frame="' + framedata['m_color_liner'] + '" data-type="' + framedata['m_frame_type'] + '">' +
                            '<div class="pz-design-item-content">' +
                            '<div class="pz-design-item-img" style="background: url(' + linerThumbPath + '); width: 50px; height: 50px;"></div>' +
                            '<div class="pz-design-item-name">' + framedata['m_sku'] + ' </div>' +
                            '<div class="pz-design-item-name">' + framedata['m_color_liner'] + '</div>' +
                            '</div>' +
                            '</li>';
                        //}
                    }
                    i++;
                });
            }

            $.each(frameColorFilter, function (frameColorFilterkey, frameColorFilterdata) {
                colorlist += '<div class="maincolor"><div class="checkmainarea" id="maincolor' + frameColorFilterkey.replace(/\s/g, '').toLowerCase() + '"><input type="checkbox" class="maincolorinput" id="' + frameColorFilterkey + '" name="' + frameColorFilterkey + '" value="' + frameColorFilterkey + '"><label for="' + frameColorFilterkey + '"> ' + frameColorFilterkey + '</label></div><div class="subcolor">';
                $.each(frameColorFilterdata, function (key, val) {
                    colorlist += '<div class="checkarea" id="subcolor' + val.replace(/\s/g, '').toLowerCase() + '"><input type="checkbox" class="subcolorinput" id="' + val + '" name="' + val + '" value="' + val + '"><label for="' + val + '"> ' + val + '</label></div>';
                })
                colorlist += '</div></div>';
            });
            $('.pz-liner .colorlist').html(colorlist);
            console.log(mediaframehtml)
            $('.linerli').html(mediaframehtml);

            //         $('.linerli').owlCarousel('destroy');
            //         $('.linerli').owlCarousel({
            //             loop: false,
            //             margin: 10,
            //             nav: true,
            //             navText: [
            //     '<i class="fa fa-chevron-left" aria-hidden="true"></i>',
            //     '<i class="fa fa-chevron-right" aria-hidden="true"></i>'
            // ],
            //             responsive: {
            //                 0: {
            //                     items: 1
            //                 },
            //                 600: {
            //                     items: 3
            //                 },
            //                 1000: {
            //                     items: 5
            //                 }
            //             }
            //         });
            // console.log("linertitle");
            $('.pz-liner .pz-optionwidthsearch ul').append(widthLi);
            // $('.pz-item-selected-liner').html(' /L0023/Antique Gold test3');

        },
        callMatRightContent: function (matArray, matTypeOption) {
            console.log("checkmat", matTypeOption);
            console.log(matArray);
            var self = this, selectedMedia, selectedTreatment, returnedData, returnedFrameData;
            var framedetail = '', locSearchVal = '', colorSearchVal = [], widthSearchVal = '', frameColorFilter = {},
                colorSubVal = [], typeSearchVal = '', framesizefilter = {}, frametypefilter = {};
            selectedMedia = $(self.options.mediumOptionDiv).find(".medium-select-elem option:selected").val();
            selectedTreatment = $(self.options.mediumOptionDiv).find(".treatment-select-elem option:selected").val();
            var frameDefault = $('#frame_defalt').val();
            returnedData = $(self.options.apiReturnData).val();
            returnedFrameData = $(self.options.mageFrameData).val();
            var artworkData = {};
            artworkData.outerWidth = "24";
            artworkData.outerHeight = "32";
            artworkData.frameWidth = "3.75";
            artworkData.linerWidth = 0;
            artworkData.frameType = "Standard";
            var glassDimention = getGlassDimention(artworkData)
            returnedData = JSON.parse(returnedData);
            returnedFrameData = matArray;
            var frameTypesAllowed = [];
            $.each(returnedData[selectedMedia]['treatment'][selectedTreatment]['frames'], function (framekey, framedata) {
                frameTypesAllowed.push(framekey);
            });
            var frameType = "Standard";
            frameType = frameType.toLowerCase();
            frameTypesAllowed = [frameType];
            var requiresTopMat = returnedData[selectedMedia]['treatment'][selectedTreatment]['requires_top_mat'];
            var requiresBotMat = returnedData[selectedMedia]['treatment'][selectedTreatment]['requires_bottom_mat'];
            var selectedFrameText = '';
            var selected = '';
            if(self.vars.pageEdit == 0 && self.vars.cartProperties['top mat'])   {
                if(self.vars.cartProperties['top mat'] ==  'No Mat')    {
                    selected = 'selectedFrame';
                    self.vars.customCartProperty[self.vars.tabLabels['topmatli']] = 'No Mat';
                }
                self.vars.tabloops++;
            }
            var mediaframehtml = '<li class="pz-design-item no-mat zeroth-value '+selected+'" data-color="" data-sku="" data-width="" data-color-frame="" data-type="">'+
                '<div class="pz-design-item-content">'+
                '<div class="pz-design-item-img" style="background: url(&quot;https://devcloud.productimize.com/v3/promizenode/./assets/images/61/OptionImages/StandardImage/IMAGE-1608031183157.PNG&quot;); width: 50px; height: 50px;"></div>'+
                '<div class="pz-design-item-name">No Mat</div>'+
                '</div>'+
                '</li>';
            selected = '';
            if(self.vars.pageEdit == 0 && self.vars.cartProperties['bottom mat'])   {
                if(self.vars.cartProperties['bottom mat'] ==  'No Mat')    {
                    selected = 'selectedFrame';
                    self.vars.customCartProperty[self.vars.tabLabels['bottommatli']] = 'No Mat';
                }
                self.vars.tabloops++;
            }
            var mediaframebothtml = '<li class="pz-design-item no-mat zeroth-value '+selected+'" data-color="" data-sku="" data-width="" data-color-frame="" data-type="">'+
                '<div class="pz-design-item-content">'+
                '<div class="pz-design-item-img" style="background: url(&quot;https://devcloud.productimize.com/v3/promizenode/./assets/images/61/OptionImages/StandardImage/IMAGE-1608031183157.PNG&quot;); width: 50px; height: 50px;"></div>'+
                '<div class="pz-design-item-name">No Mat</div>'+
                '</div>'+
                '</li>';
            var nomathtml = mediaframehtml;
            let widthdata = [];
            let widthLi = '<li class="pz-design-item widthli" id="widthli0">Select Width</li>';
            let typeLi = '<li class="pz-design-item typeli" id="typeli0">Select Type</li>';
            let colorlist = '<div class="clearcolor">CLEAR ALL</div><div class="maincolor"><input type="checkbox" id="All Color Top" class="allcolorinput" name="All Color" value="All Color" /><label for="All Color Top"> All Color</label></div>';

            let colorlistbot = '<div class="clearcolor">CLEAR ALL</div><div class="maincolor"><input type="checkbox" id="All Color Bot" class="allcolorinput" name="All Color" value="All Color" /><label for="All Color Bot"> All Color</label></div>';
            var i = 1;
            let typearray = [];

            var requiresMat = (matTypeOption == 'topmat') ?  requiresTopMat : requiresBotMat;
            if( (matTypeOption == "topMat" && parseInt(requiresTopMat) !=0) || (matTypeOption != "topMat" && parseInt(requiresBotMat) !=0)) {
                mediaframehtml = '';
                mediaframebothtml = '';
                $.each(returnedFrameData, function (framekey, framedata) {
                    console.log(framedata);
                    console.log(framedata['m_mat_type']);
                    console.log(frameTypesAllowed);
                    if ($.inArray(framedata['m_mat_type'], frameTypesAllowed) !== -1) {
                        //if(parseFloat(framedata['m_mat_rabbet_depth']) >= parseFloat(returnedData[selectedMedia]['treatment'][selectedTreatment]['min_rabbet_depth'])) {
                        // if($.inArray( framedata['m_mat_width'], widthdata ) == -1)   {
                        //     console.log(framedata)
                        //     widthdata.push(framedata['m_mat_width']);
                        //     let dataKey = framedata['m_mat_width'].replace(/\./g, "")+','+framedata['m_color_family']+','+framedata['m_mat_type'];
                        //     widthLi += '<li class="pz-design-item widthli" dataKey="'+dataKey+'" id="widthli'+framedata['m_mat_width'].replace(/\./g, "")+'">'+framedata['m_mat_width']+'</li>';
                        // }
                        console.log(typearray);
                        if ($.inArray(framedata['m_mat_type'].trim(), typearray) == -1) {
                            typearray.push(framedata['m_mat_type']);
                        }

                        console.log(typearray);
                        if (framedata['m_color_family']) {
                            if (!frameColorFilter[framedata['m_color_family']]) {
                                frameColorFilter[framedata['m_color_family']] = [];
                            }
                            if ($.inArray(framedata['m_color_mat'].trim(), frameColorFilter[framedata['m_color_family']]) == -1) {
                                frameColorFilter[framedata['m_color_family']].push(framedata['m_color_mat'].trim());
                            }
                        }
                        selected = '';
                        if (i == 1) {
                            // selected = 'selectedFrame';
                            selectedFrameText = ' / ' + ' B97 ' + ' / ' + ' White';
                            const data = {
                                'sku': 'B97',
                                'width': 'White'
                            }

                            //callFrameData(data);
                        }
                        if(self.vars.pageEdit == 0 && self.vars.cartProperties['top mat'])   {
                            if(self.vars.cartProperties['top mat'] ==  framedata['m_sku'])    {
                                selected = 'selectedFrame';
                                self.vars.customCartProperty[self.vars.tabLabels['topmatli']] = framedata['m_sku'];
                                if(framedata['m_sku'] != '' && framedata['m_color_family'] != '') {
                                    $('.pz-item-selected-topmat').html(framedata['m_sku']+'/'+framedata['m_color_family']);
                                    $('.pz-item-selected-topmat').attr('data-sku', framedata['m_sku']);
                                }
                            }
                        }                  
                        var matPath = 'https://devcloud.productimize.com/productimizedemo/perficientJS/images/mats/';
                        var matThumbImage = matPath + framedata['m_sku'] + '_thumbnail.PNG';

                        mediaframehtml += '<li class="pz-design-item ' + selected + '" data-color="' + framedata['m_color_family'] + '" data-sku="' + framedata['m_sku'] + '" data-width="' + framedata['m_mat_width'] + '" data-color-frame="' + framedata['m_color_mat'] + '" data-type="' + framedata['m_mat_type'] + '">' +
                            '<div class="pz-design-item-content">' +
                            '<div class="pz-design-item-img" style="background: url(' + matThumbImage + '); width: 50px; height: 50px;"></div>' +
                            '<div class="pz-design-item-name">' + framedata['m_sku'] + ' </div>' +
                            '<div class="pz-design-item-name">' + framedata['m_color_mat'] + '</div>' +
                            '</div>' +
                            '</li>';

                        selected = '';
                        if(self.vars.pageEdit == 0 && self.vars.cartProperties['bottom mat'])   {
                            console.log('ffffff',self.vars.cartProperties['bottom mat'],'sss',framedata['m_sku'])
                            if(self.vars.cartProperties['bottom mat'] ==  framedata['m_sku'])    {
                                selected = 'selectedFrame';
                                console.log('ffffff',self.vars.cartProperties['bottom mat'],'sss',framedata['m_sku'],selected)
                                self.vars.customCartProperty[self.vars.tabLabels['bottommatli']] = framedata['m_sku'];
                                if(framedata['m_sku'] != '' && framedata['m_color_family'] != '') {
                                    $('.pz-item-selected-bottommat').html(framedata['m_sku']+'/'+framedata['m_color_family']);
                                    $('.pz-item-selected-bottommat').attr('data-sku', framedata['m_sku']);
                                }
                            }
                        }

                        mediaframebothtml += '<li class="pz-design-item ' + selected + '" data-color="' + framedata['m_color_family'] + '" data-sku="' + framedata['m_sku'] + '" data-width="' + framedata['m_mat_width'] + '" data-color-frame="' + framedata['m_color_mat'] + '" data-type="' + framedata['m_mat_type'] + '">' +
                        '<div class="pz-design-item-content">' +
                        '<div class="pz-design-item-img" style="background: url('+matThumbImage+'); width: 50px; height: 50px;"></div>' +
                        '<div class="pz-design-item-name">' + framedata['m_sku'] + ' </div>' +
                        '<div class="pz-design-item-name">' + framedata['m_color_mat'] + '</div>' +
                        '</div>' +
                        '</li>';
                        //}
                    }
                    i++;
                });
                console.log(mediaframehtml);
            }
            $.each(frameColorFilter, function (frameColorFilterkey, frameColorFilterdata) {
                colorlist += '<div class="maincolor"><div class="checkmainarea" id="maincolor' + frameColorFilterkey.replace(/\s/g, '').toLowerCase() + '"><input type="checkbox" class="maincolorinput" id="Top ' + frameColorFilterkey + '" name="' + frameColorFilterkey + '" value="' + frameColorFilterkey + '"><label for="Top ' + frameColorFilterkey + '"> ' + frameColorFilterkey + '</label></div><div class="subcolor">';
                colorlistbot += '<div class="maincolor"><div class="checkmainarea" id="botmaincolor' + frameColorFilterkey.replace(/\s/g, '').toLowerCase() + '"><input type="checkbox" class="maincolorinput" id="bot' + frameColorFilterkey + '" name="' + frameColorFilterkey + '" value="' + frameColorFilterkey + '"><label for="bot' + frameColorFilterkey + '"> ' + frameColorFilterkey + '</label></div><div class="subcolor">';
                $.each(frameColorFilterdata, function (key, val) {
                    colorlist += '<div class="checkarea" id="subcolor' + val.replace(/\s/g, '').toLowerCase() + '"><input type="checkbox" class="subcolorinput" id="Top ' + val + '" name="' + val + '" value="' + val + '"><label for="Top ' + val + '"> ' + val + '</label></div>';
                    colorlistbot += '<div class="checkarea" id="botsubcolor' + val.replace(/\s/g, '').toLowerCase() + '"><input type="checkbox" class="subcolorinput" id="bot' + val + '" name="' + val + '" value="' + val + '"><label for="bot' + val + '"> ' + val + '</label></div>';
                })
                colorlist += '</div></div>';
                colorlistbot += '</div></div>';
            });

            $.each(typearray, function (typekey, typeval) {
                typeLi += '<li class="pz-design-item typeli" id="typeli' + typeval + '">' + typeval + '</li>';
            });
            if (matTypeOption == "topmat") {
                $('.topmatli').html("");
                if(parseInt(requiresTopMat) == 0) {
                    $('.topmatli').html(nomathtml);
                } else {
                    $('.topmatli').html(mediaframehtml);
                }
                $('.pz-top-mat .colorlist').html(colorlist);
                $('.pz-top-mat').find('.pz-optiontypesearch ul').html(typeLi);
            }
            else if (matTypeOption == "bottommat") { console.log("elseif");
                $('.bottommatli').html("");
                if(parseInt(requiresBotMat) == 0) { console.log("elseif if");
                    $('.bottommatli').html(nomathtml);
                } else {
                    $('.bottommatli').html(mediaframebothtml);
                }
                $('.pz-bottom-mat .colorlist').html(colorlistbot);
                $('.pz-bottom-mat').find('.pz-optiontypesearch ul').html(typeLi);
            }

            // if(parseInt(requiresTopMat) !=0) {
            //     $('.topmatli').html(mediaframehtml);
            // }
            // if(parseInt(requiresBotMat) !=0) {
            //     $('.bottommatli').html(mediaframebothtml);
            // }

            console.log(nomathtml);

            
            if(self.vars.pageEdit == 0)   {
                setTimeout(() => {
                    renderEditImage(self.vars.customCartProperty);
                    self.vars.pageEdit = 1;
                }, 3000);
               
            }
            //         $('.linerli').owlCarousel('destroy');
            //         $('.linerli').owlCarousel({
            //             loop: false,
            //             margin: 10,
            //             nav: true,
            //             navText: [
            //     '<i class="fa fa-chevron-left" aria-hidden="true"></i>',
            //     '<i class="fa fa-chevron-right" aria-hidden="true"></i>'
            // ],
            //             responsive: {
            //                 0: {
            //                     items: 1
            //                 },
            //                 600: {
            //                     items: 3
            //                 },
            //                 1000: {
            //                     items: 5
            //                 }
            //             }
            //         });


            // $('.pz-item-selected-topmat').html(' /B97/White');
            $('.pz-top-mat .pz-optionwidthsearch ul').append(widthLi);
            //$('.pz-top-mat .pz-item-selected-frame').html(selectedFrameText);
            $('.pz-bottom-mat .pz-optionwidthsearch ul').append(widthLi);

            // $('.pz-bottom-mat .pz-item-selected-botmat').html(selectedFrameText);

        },
        resetNextTabs: function (currentVal, setSelectedOptions = null) {
            var localObj = this.vars.customizerTabsObj;
            var currentTab = currentVal.toLowerCase();
            var upcoming = '';
            var resetSelectedOptionInc = 0, resetSelectedOptions = [];
            var minsizetext = $('.pz-size .rangeleft span').length;
            if (currentTab == 'medtrt' && minsizetext) {
                var mintext = $('.pz-size .rangeleft span').html();
                //$( "#slider" ).slider( "value", '12x16');
                $('.pz-size output').html(mintext);
                $('.pz-size output').css({'position': 'absolute', 'left': '0%'});
            }
            let customCartProperty = this.vars.customCartProperty;
            let tabLabels = this.vars.tabLabels;
            $.each(this.vars.customizerTabs, function (tab, value) {
                if (value == currentTab) {
                    upcoming = tab;
                }
                if (upcoming != '' && tab > upcoming) {
                    resetSelectedOptionInc++;
                    resetSelectedOptions.push(value);
                    $('.pz-item-selected-' + value).html('');
                    $('.pz-design-item-list.' + value + 'li li').removeClass('selectedFrame');
                    localObj[value][0] = 0;
                    //localObj[value][1] = 0;
                    if(customCartProperty[tabLabels[value]])   {
                        delete customCartProperty[tabLabels[value]];
                    }
                    if(customCartProperty[tabLabels[value+'li']])   {
                        delete customCartProperty[tabLabels[value+'li']];
                    }
                    $('.pz-custom-item-header[data-tab=' + value + '] .pz-item-header .pz-item-step-number').css('display', 'flex');
                    $('.pz-custom-item-header[data-tab=' + value + '] .pz-item-header .pz-tick.pz-tick-success').css('display', 'none');
                    $('[data-tab=' + value + ']').parent().find('.pz-custom-item-body textarea').val('');
                    $('[data-tab=' + value + ']').parent().find('.pz-custom-item-body input').prop('checked', false);
                }
            });
            this.vars.customizerTabsObj = localObj;


            // Call update canvas
            if (resetSelectedOptionInc > 0 && this.vars.pageEdit == 1) {
                updatePZSelectedOptions(setSelectedOptions, resetSelectedOptions);
            }


        }
    });
    return $.mage.customisedOptions;
});
