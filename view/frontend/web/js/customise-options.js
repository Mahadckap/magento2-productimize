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
            preSizeLabelDiv: '.pz-custom-content-wrapper .size-option .pz-item-title-selected-text',
            sizeSlider: '.pz-customizer-section .pz-custom-content-wrapper output[name="rangeVal"]',
            apiReturnData: '#pz_platform_custom_returndata',
            mageFrameData: '#pz_magento_framedata',
            customiseUrl: 'productimize/index/option',
            isAjaxSuccess: false
        },
        vars: {
            customizerTabs : ['none', 'medtrt', 'size', 'frame', 'topmat', 'bottommat', 'liner', 'customcolor', 'sidemark'],
            customizerTabsObj : {'medtrt':[0,1], 'size':[0,1], 'frame':[0, 0], 'topmat':[0, 0], 'bottommat':[0, 0], 'liner':[0, 0], 'customcolor':[0, 0], 'sidemark':[0, 0]} // etc.
        },
        _create: function () {
            var self = this;

            // $('body').on('change', '.pz-customizer-section .pz-custom-content-wrapper .medium-option .treatment-select-elem', self.customiseSizeOption.bind(this));

            $(document).on('click', this.options.sizeOptionDiv, function () {
                // if (!self.options.isAjaxSuccess) {
                //   self.customiseSizeOption();
                //   }


                //   if (self.options.isAjaxSuccess) {
                //active size tab
                // $(".pz-custom-items").removeClass("open");
                // $(self.options.sizeOptionDiv).parent().addClass('open');


                //title append
                if ($(self.options.preSizeLabelDiv).html() == "") {
                    if ($(self.options.sizeSlider).text()) {
                        var str = $(self.options.sizeSlider).text();
                        self.sizeTitleAppend(str);
                    }
                    $('body').on('DOMSubtreeModified', self.options.sizeSlider, function () {
                        if ($(this).text()) {
                            self.sizeTitleAppend($(this).text());
                            self.callFrameRightContent($(this).text());
                            console.log($(this).text());
                            console.log('triggered frame update');
                        }
                    });
                }
                // }
            });

            var level = 2;
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
            }

            //start:frame part
            // $(document).on('click', this.options.frameOptionDiv, function () {
            //     $('.pz-design-item-list.frameli li').removeClass('selectedFrame');
            //     $('.pz-item-selected-frame').html('');
            //
            // });
            //end:frame part

            //start:top mat part
            // start: TODO
            var level = 3, isDefaultTopMat, requireTopMatForTreament;
            var defaultMedium = "papper_matte";
            var defaultTreatment = "deck_top_bot_hf_sbox";
            var defaultSize = "6×8";
            var dafaultFrame = "M0907";

            isDefaultTopMat = 1;
            requireTopMatForTreament = 1;
            var default_config = $('#pz_magento_default_options').val();

            $(document).on('click', this.options.topMatOptionDiv, function () { console.log("topmat st");
                // $('.pz-design-item-list.topmatli li').removeClass('selectedFrame');
                // $('.pz-item-selected-topmat').html('');
                if (level <= 4) {
                    var selectedMediumOption = $(self.options.mediumOptionDiv).find(".medium-select-elem option:selected").val();
                    var selectedTreatmentOption = $(self.options.mediumOptionDiv).find(".treatment-select-elem option:selected").val();
                    var selectedMediumOption = "papper_matte";
                    var selectedTreatmentOption = "deck_top_bot_hf_sbox";

                    if (typeof selectedMediumOption != "undefined" && typeof selectedTreatmentOption != "undefined") {

                        if (defaultMedium != selectedMediumOption || defaultTreatment != selectedTreatmentOption) { console.log('1ifcond');
                            if (requireTopMatForTreament) { console.log('req');
                                self.getFirstMatCondition();
                            } else { console.log('no req');
                                console.log("not requireTopmatForTreament");
                                //disable topmat
                            }

                        } else {
                            console.log("default op");
                            if(isDefaultTopMat){ console.log("have default op");
                                self.getFirstMatCondition();
                            } else {
                                console.log("not have default op");
                                //disable topmat
                            }
                        }


                    } else {
                        console.log("undefined");
                        //disable topmat
                    }
                } else {
                    //level:disable topmat
                }
            });

            //mat title append
            $(document).on("click", ".topmatli li", function(e) {
                $('.pz-design-item-list.topmatli li').removeClass('selectedFrame');
                $(this).addClass('selectedFrame');
                var selectedSku = $(this).attr('data-sku');
                var selectedColor = $(this).attr('data-color');
                var selectedTopMatText = '';
                if(selectedSku != '' && selectedColor != '') {
                    selectedTopMatText = ' /'+selectedSku+'/'+selectedColor;
                }
                $('.pz-item-selected-topmat').html(selectedTopMatText);
            });
            //ends:topmat part

            //start:bottom mat part
            // start: TODO
            var level = 3, isDefaultBottomMat, requireBottomMatForTreament;
            var defaultMedium = "papper_matte";
            var defaultTreatment = default_config.treatment_default_sku;
            var defaultSize = "6×8";
            var dafaultFrame = "M0907";

            isDefaultBottomMat = 1;
            requireBottomMatForTreament = 1;

            $(document).on('click', this.options.bottomMatOptionDiv, function () { console.log("bottommat st");
                // $('.pz-design-item-list.bottommatli li').removeClass('selectedFrame');
                // $('.pz-item-selected-botmat').html('');
                if (level <= 4) {
                    // var selectedMediumOption = $(self.options.mediumOptionDiv).find(".medium-select-elem option:selected").attr('data-sku');
                    //var selectedTreatmentOption = $(self.options.mediumOptionDiv).find(".treatment-select-elem option:selected").attr('data-sku');
                    var selectedMediumOption = "papper_matte";
                    var selectedTreatmentOption = "deck_top_bot_hf_sbox";

                    if (typeof selectedMediumOption != "undefined" && typeof selectedTreatmentOption != "undefined") {

                        if (defaultMedium != selectedMediumOption || defaultTreatment != selectedTreatmentOption) { console.log('1ifcond');
                            if (requireBottomMatForTreament) { console.log('req');
                                self.getFirstMatCondition();
                            } else { console.log('no req');
                                console.log("not require bot matForTreament");
                                //disable bottommat
                            }

                        } else {
                            console.log("default op");
                            if(isDefaultBottomMat){ console.log("have default op");
                                self.getFirstMatCondition();
                            } else {
                                console.log("not have default op");
                                //disable bottommat
                            }
                        }


                    } else {
                        console.log("undefined");
                        //disable bottommat
                    }
                } else {
                    //level:disable bottommat
                }
            });

            //bottom mat title append
            $(document).on("click", ".bottommatli li", function(e) {
                $('.pz-design-item-list.bottommatli li').removeClass('selectedFrame');
                $(this).addClass('selectedFrame');
                var selectedSku = $(this).attr('data-sku');
                var selectedColor = $(this).attr('data-color');
                var selectedBottomMatText = '';
                if(selectedSku != '' && selectedColor != '') {
                    selectedBottomMatText = ' /'+selectedSku+'/'+selectedColor;
                }
                $('.pz-item-selected-bottommat').html(selectedBottomMatText);
            });
            //ends:bottom-mat part

            //start:liner part
            // start: TODO
            var level = 3, isDefaultLiner, keepDefaultLiner, requireLinerForTreament, frameType;
            var defaultMedium = "papper_matte";
            var defaultTreatment = "deck_top_bot_hf_sbox";
            var defaultSize = "6×8";
            var dafaultFrame = "M0907";

            requireLinerForTreament = 1;
            frameType = 'Standard';
            frameType = frameType.toLowerCase();
            isDefaultLiner = 1;
            keepDefaultLiner = 1;
            // ends: TODO


            $(document).on('click', this.options.linerOptionDiv, function () {
                // $('.pz-design-item-list.linerli li').removeClass('selectedFrame');
                // $('.pz-item-selected-liner').html('');
                if (level != 4) {
                    // var selectedMediumOption = $(self.options.mediumOptionDiv).find(".medium-select-elem option:selected").attr('data-sku');
                    //var selectedTreatmentOption = $(self.options.mediumOptionDiv).find(".treatment-select-elem option:selected").attr('data-sku');
                    var selectedMediumOption = "papper_matte1";
                    var selectedTreatmentOption = "deck_top_bot_hf_sbox";
                    var selectedSizeOption = $(self.options.sizeSlider).text();
                    selectedSizeOption = $.trim(selectedSizeOption);
                    var selectedFrameOption = $(self.options.frameOptionDiv).find('.pz-design-item.selectedFrame').attr('data-sku');
                    if (typeof selectedMediumOption != "undefined" && typeof selectedTreatmentOption != "undefined") {
                        if (defaultMedium != selectedMediumOption || defaultTreatment != selectedTreatmentOption) {
                            if (requireLinerForTreament && frameType == 'standard') {
                                console.log("change pass");
                                self.getLinerArray();
                            } else { console.log("change fail");
                                //disable liner
                            }
                        } else {
                            console.log("nochange");
                            if (isDefaultLiner) {console.log("isDefaultLiner");
                                if (defaultSize != selectedSizeOption || dafaultFrame != selectedFrameOption) { console.log("size change");
                                    if (frameType == 'standard') { console.log(" select");
                                        self.getLinerArray();
                                    }
                                } else {console.log("no size change");
                                    //dou
                                    if (!keepDefaultLiner) {
                                        //$('.pz-item-selected-liner').html(selectedFrameText);
                                    }
                                }
                            } else { console.log("no isDefaultLiner");
                                //disable liner
                            }
                        }
                    } else {  console.log("undefined");
                        //disable liner
                    }
                } else {
                    //disable liner
                }
            });

            //liner title append
            $(document).on("click", ".linerli li", function(e) {
                $('.pz-design-item-list.linerli li').removeClass('selectedFrame');
                $(this).addClass('selectedFrame');
                var selectedSku = $(this).attr('data-sku');
                var selectedColor = $(this).attr('data-color');
                var selectedLinerText = '';
                if(selectedSku != '' && selectedColor != '') {
                    selectedLinerText = ' /'+selectedSku+'/'+selectedColor;
                }
                $('.pz-item-selected-liner').html(selectedLinerText);
            });
            //ends:liner part
            $('body').on("click", ".pz-custom-item-header", function(e) {
                let selectedMedia = $(".medium-select-elem").val();
                let selectedTreatment = $(".treatment-select-elem").val();
                var sidemark;
                if(selectedMedia != '' && selectedTreatment != '')  {
                    // $('.pz-custom-items').removeClass("open");
                    // $(this).parent('.pz-custom-items').addClass("open");
                    var tab = $(this).attr('data-tab');
                    console.log('click on tab');
                    console.log(tab);
                    console.log(self.vars.customizerTabsObj);

                    if(self.vars.customizerTabsObj[tab][1] == 1) {
                        if(tab == 'sidemark') {
                            var customcolor = $('.pz-text-item textarea').val();
                            if(customcolor) {
                                self.vars.customizerTabsObj['customcolor'][0] = 1;
                            } else {
                                self.vars.customizerTabsObj['customcolor'][0] = 0;
                            }
                            sidemark = $('.pz-side-mark .pz-textarea').val();
                            if(sidemark) {
                                self.vars.customizerTabsObj['sidemark'][0] = 1;
                            } else {
                                self.vars.customizerTabsObj['sidemark'][0] = 0;
                            }
                            if($(this).parent('.pz-custom-items').hasClass('open')) {
                                $(this).parent('.pz-custom-items').removeClass("open");
                            } else {
                                $('.pz-custom-items').removeClass("open");
                                $(this).parent('.pz-custom-items').addClass("open");
                            }
                        } else {
                            $('.pz-custom-items').removeClass("open");
                            $(this).parent('.pz-custom-items').addClass("open");
                        }
                        $.each(self.vars.customizerTabsObj, function(tab, value){
                            if(value[0] == 1) {
                                console.log('inside foreach if');
                                console.log(tab);
                                $('.pz-custom-item-header[data-tab='+tab+'] .pz-item-header .pz-item-step-number').css('display', 'none');
                                $('.pz-custom-item-header[data-tab='+tab+'] .pz-item-header .pz-tick.pz-tick-success').css('display', 'flex');
                            }
                        });
                        console.log('after each function');
                        console.log(tab);
                        if($(this).parent('.pz-custom-items').hasClass('open')) {
                            $('.pz-custom-item-header[data-tab='+tab+'] .pz-item-header .pz-item-step-number').css('display', 'flex');
                            $('.pz-custom-item-header[data-tab='+tab+'] .pz-item-header .pz-tick.pz-tick-success').css('display', 'none');
                        }
                    }
                }  else {
                    $('.pz-custom-items').removeClass("open");
                    $('.medium-option').addClass("open");
                    if($('.customred').length == 0) {
                        $('.medium-option').append('<div class="customred">*Please select media and treatment to continue</div>')
                        $('.customred').fadeOut(5000);
                    } else {
                        $('.customred').show().fadeOut(5000);
                    }
                }
            });
            $('body').on("change",".pz-medium .medium-select-elem",function() {
                var selectedText = $(this).find(':selected').text();
                var selectedMedia = $(this).find(':selected').val();

                var selectedTreatment = $('.pz_treatment select.treatment-select-elem').find(':selected').val();
                if(selectedMedia != '') {
                    $('.medium-treat .pz-item-selected-medtrt').html(selectedText);
                } else {
                    $('.medium-treat .pz-item-selected-medtrt').html('');
                }
                var treatArr = [];
                var treathtml = '<option value="" class="option">Select Treatment</option>';
                var returnedData = $(self.options.apiReturnData).val();
                var customizer_api_data =  JSON.parse(returnedData);
                $.each(customizer_api_data, function(key, data) {
                    if(key == selectedMedia) {
                        $.each(data['treatment'], function(trkey, trdata) {
                            if(trdata['display_to_customer']) {
                                treatArr.push(trkey);
                                treathtml += '<option data-sku="'+trkey+'" value="'+trkey+'" class="option">'+trdata['display_name']+'</option>';
                            }
                        });
                        // else if(treatDefault != 'undefined') {
                        //     console.log('inside elseif');
                        //     var html = '<option selected data-sku="'+treatDefault+'" value="'+treatDefault+'" class="option">'+treatDefault+'</option>';
                        //     $('.pz-medium select.treatment-select-elem').append(html);
                        // }
                        return true;
                    }
                });
                $('.pz_treatment select.treatment-select-elem').html(treathtml);
                // if($.inArray(treatDefault, treatArr) !== -1 && selectedMedia == mediaDefault) {
                //     $('.pz_treatment select.treatment-select-elem').val(treatDefault).trigger('change');
                // }
                // if($.inArray(selectedTreatment, treatArr) !== -1) {
                //     $('.pz_treatment select.treatment-select-elem').val(selectedTreatment).trigger('change');
                // }
                self.resetNextTabs('medtrt');
                $('.pz_treatment select.treatment-select-elem').selectric('refresh');
            });
            $('body').on("change",".pz_treatment .treatment-select-elem",function() {
                var selectedText = $(this).find(':selected').text();
                var selectedVal = $(this).find(':selected').val();

                var selectedmedia = $(".medium-select-elem").find(':selected').text();
                var mediaVal = $(".medium-select-elem").find(':selected').val();

                if(selectedVal != '') {
                    //frameContent(mediaVal, selectedVal);
                    var finalText = selectedmedia +'/'+selectedText;
                    self.vars.customizerTabsObj.medtrt[0] = 1;
                } else {
                    var finalText = selectedmedia;
                }

                $('.medium-treat .pz-item-selected-medtrt').html(finalText);
                self.resetNextTabs('medtrt');
                setPZSelectedOptions({'name': 'treatment', 'sku' : selectedVal, 'displayName': selectedText});
            });
            $('body').on("click", ".frameli li, .linerli li, .topmatli li, .bottommatli li", function(e) {
                console.log("frame lis is calling")
                console.log($(this).attr('data-sku'), $(this).attr('data-width'))
                const data = {
                    'sku':$(this).attr('data-sku'),
                    'width': $(this).attr('data-width')
                }
                let arrayy = {"frameli":"frame","topmatli":"topMat","bottommatli":"bottomMat","linerli":"liner"};
                let parentClass = $(this).parents('.pz-design-item-list').attr('dataFrom');
                var nextTab = $(this).parents('.pz-custom-items').children('.pz-custom-item-header').attr('data-nexttab');
                console.log(nextTab);
                var clickedTab = arrayy[parentClass].toLowerCase();
                self.vars.customizerTabsObj[clickedTab][0] = 1;
                self.vars.customizerTabsObj[nextTab][1] = 1;
                if(nextTab == 'customcolor') {
                    self.vars.customizerTabsObj[nextTab][1] = 1;
                    self.vars.customizerTabsObj['sidemark'][1] = 1;
                }
                self.resetNextTabs(arrayy[parentClass]);
                setPZSelectedOptions({'name': arrayy[parentClass], 'sku' : $(this).attr('data-sku'), 'displayName': $(this).find('.pz-design-item-name:first').text(),'width':$(this).attr('data-width')});
                //callFrameData (data);

            });
        },

        getFirstMatCondition: function () {
            console.log("getFirstMatCondition");

            // start: TODO
            var defaultMedium = "papper_matte";
            var defaultTreatment = "deck_top_bot_hf_sbox";
            var defaultSize = "6×8";
            var dafaultFrame = "M0907";

            var isDefaultBottomMat = 1;
            // ends: TODO

            // var selectedMediumOption = $(self.options.mediumOptionDiv).find(".medium-select-elem option:selected").attr('data-sku');
            //var selectedTreatmentOption = $(self.options.mediumOptionDiv).find(".treatment-select-elem option:selected").attr('data-sku');
            var selectedMediumOption = "papper_matte";
            var selectedTreatmentOption = "deck_top_bot_hf_sbox";
            var selectedSizeOption = $(this.options.sizeSlider).text();
            selectedSizeOption = $.trim(selectedSizeOption);
            var selectedFrameOption = $(this.options.frameOptionDiv).find('.pz-design-item.selectedFrame').attr('data-sku');

            var glassDimention = this.getDimention();
            console.log(glassDimention);
            var width = glassDimention[0];
            var height = glassDimention[1];

            if (width > 40 && height > 60) {
                //display mat with no op to select
            } else {
                var matArray = [];
                if (defaultMedium != selectedMediumOption || defaultTreatment != selectedTreatmentOption || defaultSize != selectedSizeOption || dafaultFrame != selectedFrameOption) {
                    console.log('1con elas if');
                    matArray = this.getSecondMatCondition();
                    // display mat
                } else {
                    if(isDefaultTopMat){ console.log('1con elas esle if');
                        //display default mat
                    } else { console.log('1con elas esle else if');
                        matArray = this.getSecondMatCondition();
                        // display mat
                    }

                }
            }

        },

        getSecondMatCondition: function () {
            console.log("getSecondMatCondition");

            var glassDimention = this.getDimention();
            var width = glassDimention[0];
            var height = glassDimention[1];
            var matArray = [];

            if (width > 32 && height > 40) { console.log("over");
                return this.getTopMatArray('oversized');
            } else { console.log("stand");
                return this.getTopMatArray('standard');
            }
        },

        getDimention: function () {
            var selectedSizeOption = $(this.options.sizeSlider).text();
            selectedSizeOption = $.trim(selectedSizeOption);

            var artworkData = {};
            if(selectedSizeOption.indexOf('x') != -1){
                var selectedSize = selectedSizeOption.split('x');
            } else {
                var selectedSize = selectedSizeOption.split('\u00d7');
            }
            console.log(selectedSize);
            artworkData.outerWidth = selectedSize[0];
            artworkData.outerHeight = selectedSize[1];
            artworkData.frameWidth = 1;
            artworkData.linerWidth = 0;
            artworkData.frameType = 'Standard';
            return getGlassDimention(artworkData);

        },

        getTopMatArray: function (type) {
            type = type.trim();

            var matData = [
                {
                    m_sku: 'B97',
                    m_name: 'Mat B97',
                    m_status: 1,
                    m_mat_type: "oversized",
                    m_fabric_cost_per_lin_ft: 0,
                    m_specialty_note : '',
                    m_color_mat: 'Bright White',
                    m_color_family : 'White',
                    m_filter_thickness:'Single',
                    m_filter_type: 'Single',
                    m_filter_size: 'Single'
                }, {
                    m_sku: 'B97',
                    m_name: 'Mat B97',
                    m_status: 1,
                    m_mat_type: "standard",
                    m_fabric_cost_per_lin_ft: 0,
                    m_specialty_note : '',
                    m_color_mat: 'Bright White',
                    m_color_family : 'White',
                    m_filter_thickness:'Single',
                    m_filter_type: 'Single',
                    m_filter_size: 'Single',

                }, {
                    m_sku: 'B97',
                    m_name: 'Mat B97',
                    m_status: 1,
                    m_mat_type: "standard",
                    m_fabric_cost_per_lin_ft: 0,
                    m_specialty_note : '',
                    m_color_mat: 'Bright White',
                    m_color_family : 'White',
                    m_filter_thickness:'Single',
                    m_filter_type: 'Single',
                    m_filter_size: 'Single',
                }

            ];

            var i = 0, matArray = [];

            $.each(matData, function (key, data) {
                var matType = data['m_mat_type'].trim();
                if (matType == type) {
                    matArray[i] = data;
                    i++;
                }
            });

            console.log(matArray);
            return matArray;

        },

        getLinerArray: function () {
            var linerData = [
                {
                    m_sku: 'L0023',
                    m_name: 'Liner L0023',
                    m_liner_type: 'liner',
                    m_liner_depth: 1.375,
                    m_liner_rabbet_depth: 0.375,
                    m_color_liner : 'Antique Gold test3',
                    m_color_family : 'Gold'
                }, {
                    m_sku: 'L0004',
                    m_name: 'Liner L0004',
                    m_liner_type: 'liner',
                    m_liner_depth: 0.56,
                    m_liner_rabbet_depth: 0.25,
                    m_color_liner : 'Antique Gold test3',
                    m_color_family : 'Gold test3'
                }, {
                    m_sku: 'L0013',
                    m_name: 'Liner L0013',
                    m_liner_type: 'liner',
                    m_liner_depth: 0.68,
                    m_liner_rabbet_depth: 0.25,
                    m_color_liner : 'Antique Gold test3',
                    m_color_family : 'Gold test3'
                }
            ];
            var selectedFrameSku = $(this.options.frameOptionDiv).find('.pz-design-item.selectedFrame').attr('data-sku');
            var returnedFrameData = JSON.parse($(this.options.mageFrameData).val());
            var frameRabbetDepth = '';

            // $.each(returnedFrameData, function(framekey, framedata) {
            //     if(returnedFrameData[selectedFrameSku]){
            //         frameRabbetDepth = returnedFrameData[selectedFrameSku]['m_frame_depth'];
            //     }
            // });

            if(selectedFrameSku && returnedFrameData[selectedFrameSku]) {
                frameRabbetDepth = returnedFrameData[selectedFrameSku]['m_frame_depth'];
            }

            //console.log("frameRabbetDepth" + frameRabbetDepth);

            var returnedData = JSON.parse($(this.options.apiReturnData).val());
            var selectedMedia = $(this.options.mediumOptionDiv).find(".medium-select-elem option:selected").val();
            var selectedTreatment = $(this.options.mediumOptionDiv).find(".treatment-select-elem option:selected").val();

            var minRabbetDepth = parseFloat(returnedData[selectedMedia]['treatment'][selectedTreatment]['min_rabbet_depth']);
            //console.log("minRabbetDepth" + minRabbetDepth);
            var i = 0, linerArray = [];

            $.each(linerData, function (key, data) {
                var linerHeight = data['m_liner_depth'];
                var linerRabbetDepth = data['m_liner_rabbet_depth'];

                if ((linerHeight <= frameRabbetDepth) && (linerRabbetDepth >= minRabbetDepth) && ((linerHeight - linerRabbetDepth + minRabbetDepth) <= frameRabbetDepth)) {
                    linerArray[i] = data;
                    i++;
                }

            });

            this.callLinerRightContent(linerArray);


        },

        sizeTitleAppend: function (str) {

            var res = str.replace("×", "″w × ");
            res = ' / ' + res + "″h";

            $(this.options.sizeLabelDiv).html("");
            $(this.options.sizeLabelDiv).html("Pre-Frame Size ");

            $(this.options.preSizeLabelDiv).html("");
            $(this.options.preSizeLabelDiv).html(res);

        },

        customiseSizeOption: function () { console.log("onchange");
            var self = this, selectedMediumOption, selectedTreatmentOption;



            var matData = [
                {
                    m_sku: 'B97',
                    m_name: 'Mat B97',
                    m_mat_type: 'Standard',
                    m_mat_height: 1,
                    m_mat_rabbet_depth: 1,
                    m_color_mat : 'Bright White',
                    m_color_family : 'White'
                }, {
                    m_sku: 'B8-97',
                    m_name: 'Mat B8-97',
                    m_mat_type: 'Standard',
                    m_mat_height: 1,
                    m_mat_rabbet_depth: 1,
                    m_color_mat : 'Bright White',
                    m_color_family : 'White'
                }, {
                    m_sku: 'B98',
                    m_name: 'Mat B98',
                    m_mat_type: 'Standard',
                    m_mat_height: 1,
                    m_mat_rabbet_depth: 1,
                    m_color_mat : 'Off White',
                    m_color_family : 'White'
                }
            ];



            var mati = 0, matArray = [];
            $.each(matData, function (key, data) {
                console.log(data)
                matArray[mati] = data;
                mati++;
            });



            selectedMediumOption = $(self.options.mediumOptionDiv).find(".medium-select-elem option:selected").attr('data-sku');
            selectedTreatmentOption = $(self.options.mediumOptionDiv).find(".treatment-select-elem option:selected").attr('data-sku');

            if (typeof selectedMediumOption != "undefined" && typeof selectedTreatmentOption != "undefined") {

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
                        let sizeArray = response['content'];

                        $("#slider").slider({
                            range: "min",
                            steps: sizeArray,
                            change: function (e, ui) {
                                var control = $('#slider');
                                var output = control.next('output');

                                var leftPercent = $('.ui-slider-handle')[0].style.left;
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
                        if(selectedTreatmentOption) {
                            self.callFrameRightContent(sizeArray[0]);
                            self.callMatRightContent(matArray);
                        }
                        //self.callMatBotRightContent(matArray);
                    },
                    complete: function(xhr,status) {
                        console.log("Size ajax completed now")
                        callTreatmentData({value:1});

                    },
                    error: function (error) {
                        self.options.isAjaxSuccess = false;
                        console.log(error);
                    }
                });
            }
        },
        callFrameRightContent: function(size) {
            var defaultTreatment = "wrap";
            var self = this, selectedMedia, selectedTreatment, returnedData, returnedFrameData;
            var framedetail = '', locSearchVal = '',colorSearchVal = [], widthSearchVal = '', frameColorFilter = {}, colorSubVal = [], typeSearchVal = '', framesizefilter = {}, frametypefilter = {};
            selectedMedia = $(self.options.mediumOptionDiv).find(".medium-select-elem option:selected").val();
            selectedTreatment = $(self.options.mediumOptionDiv).find(".treatment-select-elem option:selected").val();
            var frameDefault = $('#frame_defalt').val();
            returnedData = $(self.options.apiReturnData).val();
            returnedFrameData = $(self.options.mageFrameData).val();
            var artworkData = {};
            if(size.indexOf('x') != -1){
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
            $.each(returnedData[selectedMedia]['treatment'][selectedTreatment]['frames'], function(framekey, framedata) {
                frameTypesAllowed.push(framekey);
            });
            //}

            frameTypesAllowed = ["Standard"];

            var selectedFrameText = '';
            var mediaframehtml = '';
            let widthdata = [];
            let widthLi = '<li class="pz-design-item widthli" id="widthli0">Select Width</li>';
            let colorlist = '<div class="clearcolor">CLEAR ALL</div><div class="maincolor"><input type="checkbox" id="All Color" class="allcolorinput" name="All Color" value="All Color" /><label for="All Color"> All Color</label></div>';
            $.each(returnedFrameData, function(framekey, framedata) {
                if($.inArray( framedata['m_frame_type'], frameTypesAllowed ) !== -1)   {
                    var minRabbetDepth = parseFloat(returnedData[selectedMedia]['treatment'][selectedTreatment]['min_rabbet_depth']);
                    artworkData.outerWidth = selectedSize[0];
                    artworkData.outerHeight = selectedSize[1];
                    artworkData.frameWidth = framedata['m_frame_width'];
                    artworkData.linerWidth = 0;
                    artworkData.frameType = framedata['m_frame_type'];
                    var glassDimention = getGlassDimention(artworkData);
                    var glassSize = (glassDimention[0]*glassDimention[1])/144;
                    //framedata['m_max_outer_size'] >= glassSize
                    if(parseFloat(framedata['m_frame_rabbet_depth']) >= minRabbetDepth && framedata['m_max_outer_size'] >= glassSize) {
                        if($.inArray( framedata['m_frame_width'], widthdata ) == -1)   {
                            console.log(framedata)
                            widthdata.push(framedata['m_frame_width']);
                            let dataKey = framedata['m_frame_width'].replace(/\./g, "")+','+framedata['m_color_family']+','+framedata['m_frame_type'];
                            widthLi += '<li class="pz-design-item widthli" dataKey="'+dataKey+'" id="widthli'+framedata['m_frame_width'].replace(/\./g, "")+'">'+framedata['m_frame_width']+'</li>';
                        }

                        if(framedata['m_color_family']) {
                            if(!frameColorFilter[framedata['m_color_family']])  {
                                frameColorFilter[framedata['m_color_family']] = [];
                                framesizefilter[framedata['m_color_family']] = [];
                                frametypefilter[framedata['m_color_family']] = [];
                            }
                            if($.inArray( framedata['m_color_frame'].trim(),frameColorFilter[framedata['m_color_family']] ) == -1)   {
                                frameColorFilter[framedata['m_color_family']].push(framedata['m_color_frame'].trim());
                                framesizefilter[framedata['m_color_family']].push(framedata['m_frame_width'].replace(/\./g, ""));
                                frametypefilter[framedata['m_color_family']].push(framedata['m_frame_type'].replace(/\./g, ""));
                            }
                        }

                        // if(frameDefault == framedata['m_sku'] && selectedTreatment == defaultTreatment) {
                        //     selected = 'selectedFrame';
                        //     selectedFrameText = framedata['m_sku']+' / '+framedata['m_color_family'];

                        //     $('.pz-item-selected-frame').attr('data-sku', framedata['m_sku']);
                        //     const data = {
                        //         'sku':framedata['m_sku'],
                        //         'width': framedata['m_frame_width']
                        //     }
                        //     mediaframehtml = '';
                        //     callFrameData(data);
                        // }

                        mediaframehtml += '<li class="pz-design-item" data-color="'+framedata['m_color_family']+'" data-sku="'+framedata['m_sku']+'" data-width="'+framedata['m_frame_width']+'" data-color-frame="'+framedata['m_color_frame']+'" data-type="'+framedata['m_frame_type']+'">'+
                            '<div class="pz-design-item-content">'+
                            '<div class="pz-design-item-img" style="background: url(&quot;https://devcloud.productimize.com/v3/promizenode/./assets/images/61/OptionImages/StandardImage/IMAGE-1608031183157.PNG&quot;); width: 50px; height: 50px;"></div>'+
                            '<div class="pz-design-item-name">'+framedata['m_sku']+' </div>'+
                            '<div class="pz-design-item-name">'+framedata['m_frame_width']+'"</div>'+
                            '</div>'+
                            '</li>';
                    }
                }
            });

            $.each(frameColorFilter, function(frameColorFilterkey, frameColorFilterdata) {
                // console.log(framesizefilter[frameColorFilterkey])
                // console.log(frametypefilter[frameColorFilterkey])
                var joinkeys = framesizefilter[frameColorFilterkey].concat(frametypefilter[frameColorFilterkey]).concat(frameColorFilterkey.replace(/\s/g, ''));
                console.log(joinkeys)
                colorlist += '<div class="maincolor"><div dataKey="'+joinkeys+'" class="checkmainarea" id="maincolor'+frameColorFilterkey.replace(/\s/g, '').toLowerCase()+'"><input type="checkbox" class="maincolorinput" id="'+frameColorFilterkey+'" name="'+frameColorFilterkey+'" value="'+frameColorFilterkey+'"><label for="'+frameColorFilterkey+'"> '+frameColorFilterkey+'</label></div><div class="subcolor">';
                $.each(frameColorFilterdata, function(key,val) {
                    colorlist += '<div class="checkarea" id="subcolor'+val.replace(/\s/g, '').toLowerCase()+'"><input type="checkbox" class="subcolorinput" id="'+val+'" name="'+val+'" value="'+val+'"><label for="'+val+'"> '+val+'</label></div>';
                })
                colorlist +='</div></div>';
            });
            $('.pz-frame .colorlist').html(colorlist);
            console.log($('.frameli').find('li').length);
            $('.frameli').html(mediaframehtml);
            console.log($('.frameli').find('li').length);
            //$('.frameli').owlCarousel('destroy');


            $('.pz-optionwidthsearch ul').append(widthLi);


            //     if($('.frameli').find('li').length > 0) {
            //         $('.frameli').owlCarousel('destroy');
            //         $('.frameli').owlCarousel({
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
            // }


        },
        callLinerRightContent: function(linerArray) {
            var self = this, selectedMedia, selectedTreatment, returnedData, returnedFrameData;
            var framedetail = '', locSearchVal = '',colorSearchVal = [], widthSearchVal = '', frameColorFilter = {}, colorSubVal = [], typeSearchVal = '', framesizefilter = {}, frametypefilter = {};
            selectedMedia = $(self.options.mediumOptionDiv).find(".medium-select-elem option:selected").val();
            selectedTreatment = $(self.options.mediumOptionDiv).find(".treatment-select-elem option:selected").val();
            //var linerDefault = $('#frame_defalt').val();
            var linerDefault = 'L0023';
            returnedData = $(self.options.apiReturnData).val();
            returnedFrameData = $(self.options.mageFrameData).val();
            var artworkData = {};
            artworkData.outerWidth = "24";
            artworkData.outerHeight = "32";
            artworkData.frameWidth = "3.75";
            artworkData.linerWidth = 0;
            artworkData.frameType = "Standard";
            var glassDimention = getGlassDimention (artworkData)
            returnedData = JSON.parse(returnedData);
            returnedFrameData = linerArray;
            var frameTypesAllowed = [];
            $.each(returnedData[selectedMedia]['treatment'][selectedTreatment]['frames'], function(framekey, framedata) {
                frameTypesAllowed.push(framekey);
            });
            frameTypesAllowed = ["liner"];
            var selectedFrameText = '';
            var mediaframehtml = '';
            let widthdata = [];
            let widthLi = '<li class="pz-design-item widthli" id="widthli0">Select Width</li>';
            let colorlist = '<div class="clearcolor">CLEAR ALL</div><div class="maincolor"><input type="checkbox" id="All Color" class="allcolorinput" name="All Color" value="All Color" /><label for="All Color"> All Color</label></div>';
            var i= 1;
            $('.pz-item-selected-liner').html('');
            $.each(returnedFrameData, function(framekey, framedata) {
                console.log(framedata);
                if($.inArray( framedata['m_liner_type'], frameTypesAllowed ) !== -1)   {
                    //if(parseFloat(framedata['m_liner_rabbet_depth']) >= parseFloat(returnedData[selectedMedia]['treatment'][selectedTreatment]['min_rabbet_depth'])) {
                    // if($.inArray( framedata['m_liner_width'], widthdata ) == -1)   {
                    //     console.log(framedata)
                    //     widthdata.push(framedata['m_liner_width']);
                    //     let dataKey = framedata['m_liner_width'].replace(/\./g, "")+','+framedata['m_color_family']+','+framedata['m_liner_type'];
                    //     widthLi += '<li class="pz-design-item widthli" dataKey="'+dataKey+'" id="widthli'+framedata['m_liner_width'].replace(/\./g, "")+'">'+framedata['m_liner_width']+'</li>';
                    // }
                    if(framedata['m_color_family']) {
                        if(!frameColorFilter[framedata['m_color_family']])  {
                            frameColorFilter[framedata['m_color_family']] = [];
                        }
                        if($.inArray( framedata['m_color_liner'].trim(),frameColorFilter[framedata['m_color_family']] ) == -1)   {
                            frameColorFilter[framedata['m_color_family']].push(framedata['m_color_liner'].trim());
                        }
                    }
                    if(linerDefault == 'L0023' && i ==1) {
                        selectedFrameText = ' / '+' L0023' +' / '+ 'Antique Gold test3';
                        const data = {
                            'sku':'L0023',
                            'width': 'Antique Gold test3'
                        }
                        mediaframehtml = '';
                        callFrameData(data);
                    }
                    mediaframehtml += '<li class="pz-design-item" data-color="'+framedata['m_color_family']+'" data-sku="'+framedata['m_sku']+'" data-width="'+framedata['m_liner_width']+'" data-color-frame="'+framedata['m_color_liner']+'" data-type="'+framedata['m_frame_type']+'">'+
                        '<div class="pz-design-item-content">'+
                        '<div class="pz-design-item-img" style="background: url(&quot;https://devcloud.productimize.com/v3/promizenode/./assets/images/61/OptionImages/StandardImage/IMAGE-1608031183157.PNG&quot;); width: 50px; height: 50px;"></div>'+
                        '<div class="pz-design-item-name">'+framedata['m_sku']+' </div>'+
                        '<div class="pz-design-item-name">'+framedata['m_color_liner']+'</div>'+
                        '</div>'+
                        '</li>';
                    //}
                } i++;
            });

            $.each(frameColorFilter, function(frameColorFilterkey, frameColorFilterdata) {
                colorlist += '<div class="maincolor"><div class="checkmainarea" id="maincolor'+frameColorFilterkey.replace(/\s/g, '').toLowerCase()+'"><input type="checkbox" class="maincolorinput" id="'+frameColorFilterkey+'" name="'+frameColorFilterkey+'" value="'+frameColorFilterkey+'"><label for="'+frameColorFilterkey+'"> '+frameColorFilterkey+'</label></div><div class="subcolor">';
                $.each(frameColorFilterdata, function(key,val) {
                    colorlist += '<div class="checkarea" id="subcolor'+val.replace(/\s/g, '').toLowerCase()+'"><input type="checkbox" class="subcolorinput" id="'+val+'" name="'+val+'" value="'+val+'"><label for="'+val+'"> '+val+'</label></div>';
                })
                colorlist +='</div></div>';
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
        callMatRightContent: function(matArray) {
            var self = this, selectedMedia, selectedTreatment, returnedData, returnedFrameData;
            var framedetail = '', locSearchVal = '',colorSearchVal = [], widthSearchVal = '', frameColorFilter = {}, colorSubVal = [], typeSearchVal = '', framesizefilter = {}, frametypefilter = {};
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
            var glassDimention = getGlassDimention (artworkData)
            returnedData = JSON.parse(returnedData);
            returnedFrameData = matArray;
            var frameTypesAllowed = [];
            $.each(returnedData[selectedMedia]['treatment'][selectedTreatment]['frames'], function(framekey, framedata) {
                frameTypesAllowed.push(framekey);
            });
            frameTypesAllowed = ["Standard"];
            var selectedFrameText = '';
            var mediaframehtml = '';
            let widthdata = [];
            let widthLi = '<li class="pz-design-item widthli" id="widthli0">Select Width</li>';
            let colorlist = '<div class="clearcolor">CLEAR ALL</div><div class="maincolor"><input type="checkbox" id="All Color Top" class="allcolorinput" name="All Color" value="All Color" /><label for="All Color Top"> All Color</label></div>';

            let colorlistbot = '<div class="clearcolor">CLEAR ALL</div><div class="maincolor"><input type="checkbox" id="All Color Bot" class="allcolorinput" name="All Color" value="All Color" /><label for="All Color Bot"> All Color</label></div>';
            var i=1;
            $.each(returnedFrameData, function(framekey, framedata) {
                console.log(framedata);
                if($.inArray( framedata['m_mat_type'], frameTypesAllowed ) !== -1)   {
                    //if(parseFloat(framedata['m_mat_rabbet_depth']) >= parseFloat(returnedData[selectedMedia]['treatment'][selectedTreatment]['min_rabbet_depth'])) {
                    // if($.inArray( framedata['m_mat_width'], widthdata ) == -1)   {
                    //     console.log(framedata)
                    //     widthdata.push(framedata['m_mat_width']);
                    //     let dataKey = framedata['m_mat_width'].replace(/\./g, "")+','+framedata['m_color_family']+','+framedata['m_mat_type'];
                    //     widthLi += '<li class="pz-design-item widthli" dataKey="'+dataKey+'" id="widthli'+framedata['m_mat_width'].replace(/\./g, "")+'">'+framedata['m_mat_width']+'</li>';
                    // }
                    if(framedata['m_color_family']) {
                        if(!frameColorFilter[framedata['m_color_family']])  {
                            frameColorFilter[framedata['m_color_family']] = [];
                        }
                        if($.inArray( framedata['m_color_mat'].trim(),frameColorFilter[framedata['m_color_family']] ) == -1)   {
                            frameColorFilter[framedata['m_color_family']].push(framedata['m_color_mat'].trim());
                        }
                    }
                    var selected = '';
                    if (i == 1) {
                        // selected = 'selectedFrame';
                        selectedFrameText = ' / ' + ' B97 ' + ' / ' + ' White';
                        const data = {
                            'sku': 'B97',
                            'width': 'White'
                        }

                        callFrameData(data);
                    }
                    mediaframehtml += '<li class="pz-design-item '+selected+'" data-color="'+framedata['m_color_family']+'" data-sku="'+framedata['m_sku']+'" data-width="'+framedata['m_mat_width']+'" data-color-frame="'+framedata['m_color_mat']+'" data-type="'+framedata['m_mat_type']+'">'+
                        '<div class="pz-design-item-content">'+
                        '<div class="pz-design-item-img" style="background: url(&quot;https://devcloud.productimize.com/v3/promizenode/./assets/images/61/OptionImages/StandardImage/IMAGE-1608031183157.PNG&quot;); width: 50px; height: 50px;"></div>'+
                        '<div class="pz-design-item-name">'+framedata['m_sku']+' </div>'+
                        '<div class="pz-design-item-name">'+framedata['m_color_mat']+'</div>'+
                        '</div>'+
                        '</li>';
                    //}
                }i++;
            });

            $.each(frameColorFilter, function(frameColorFilterkey, frameColorFilterdata) {
                colorlist += '<div class="maincolor"><div class="checkmainarea" id="maincolor'+frameColorFilterkey.replace(/\s/g, '').toLowerCase()+'"><input type="checkbox" class="maincolorinput" id="Top '+frameColorFilterkey+'" name="'+frameColorFilterkey+'" value="'+frameColorFilterkey+'"><label for="Top '+frameColorFilterkey+'"> '+frameColorFilterkey+'</label></div><div class="subcolor">';
                colorlistbot += '<div class="maincolor"><div class="checkmainarea" id="botmaincolor'+frameColorFilterkey.replace(/\s/g, '').toLowerCase()+'"><input type="checkbox" class="maincolorinput" id="bot'+frameColorFilterkey+'" name="'+frameColorFilterkey+'" value="'+frameColorFilterkey+'"><label for="bot'+frameColorFilterkey+'"> '+frameColorFilterkey+'</label></div><div class="subcolor">';
                $.each(frameColorFilterdata, function(key,val) {
                    colorlist += '<div class="checkarea" id="subcolor'+val.replace(/\s/g, '').toLowerCase()+'"><input type="checkbox" class="subcolorinput" id="Top '+val+'" name="'+val+'" value="'+val+'"><label for="Top '+val+'"> '+val+'</label></div>';
                    colorlistbot += '<div class="checkarea" id="botsubcolor'+val.replace(/\s/g, '').toLowerCase()+'"><input type="checkbox" class="subcolorinput" id="bot'+val+'" name="'+val+'" value="'+val+'"><label for="bot'+val+'"> '+val+'</label></div>';
                })
                colorlist +='</div></div>';
                colorlistbot +='</div></div>';
            });
            $('.pz-top-mat .colorlist').html(colorlist);
            $('.pz-bottom-mat .colorlist').html(colorlistbot);
            $('.topmatli').html(mediaframehtml);
            $('.bottommatli').html(mediaframehtml);

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
        resetNextTabs: function(currentVal) {
            var localObj = this.vars.customizerTabsObj;
            var currentTab = currentVal.toLowerCase();
            var upcoming = '';
            var minsizetext = $('.pz-size .rangeleft span').length;
            if(currentTab == 'medtrt' && minsizetext) {
                var mintext = $('.pz-size .rangeleft span').html();
                console.log('inside condition');
                 console.log(mintext);
                //$( "#slider" ).slider( "value", '12x16');
                $('.pz-size output').html(mintext);
                $('.pz-size output').css({'position':'absolute', 'left':'0%'});
            }
            $.each(this.vars.customizerTabs, function(tab, value){
               if(value == currentTab) {
                   upcoming = tab;
               }
               console.log(tab);
               console.log(value);
               if(upcoming !='' && tab > upcoming) {
                   $('.pz-item-selected-'+value).html('');
                   $('.pz-design-item-list.'+value+'li li').removeClass('selectedFrame');
                   localObj[value][0] = 0;
                   //localObj[value][1] = 0;
                   $('.pz-custom-item-header[data-tab='+value+'] .pz-item-header .pz-item-step-number').css('display', 'flex');
                   $('.pz-custom-item-header[data-tab='+value+'] .pz-item-header .pz-tick.pz-tick-success').css('display', 'none');
               }
            });
            this.vars.customizerTabsObj = localObj;
        }
    });
    return $.mage.customisedOptions;
});
