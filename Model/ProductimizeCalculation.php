<?php

namespace Mahadckap\Productimize\Model;

use Magento\Framework\App\ResourceConnection;
use Magento\Catalog\Model\ProductFactory;
use Magento\Eav\Model\ResourceModel\Entity\Attribute\Set\CollectionFactory as EavCollectionFactory;
use Magento\Catalog\Model\ResourceModel\Product\CollectionFactory;
use Magento\Eav\Model\Config;

class ProductimizeCalculation
{
    /**
     * @var ResourceConnection
     */
    protected $resourceConnection;

    protected $productFactory;
    protected $productCollectionFactory;
    protected $eavCollectionFactory;
    protected $eavConfig;

    public function __construct(
        ResourceConnection $resourceConnection,
        ProductFactory $productFactory,
        CollectionFactory $productCollectionFactory,
        EavCollectionFactory $eavCollectionFactory,
        Config $eavConfig
    )
    {
        $this->resourceConnection = $resourceConnection;
        $this->productFactory = $productFactory;
        $this->productCollectionFactory = $productCollectionFactory;
        $this->eavCollectionFactory = $eavCollectionFactory;
        $this->eavConfig = $eavConfig;
    }

    public function getTopMatCalculation($topMatParams)
    {
        $configLevel = $topMatParams['config_level'];
        $selectedMediumOption = $topMatParams['selected_medium'];
        $selectedTreatmentOption = $topMatParams['selected_treatment'];
        $hasChangedMediaTreatment = $topMatParams['has_changed_medium_treatment'];
        $requireTopMatForTreatment = $topMatParams['require_topmat_for_treatment'];
        $isDefaultTopMat = $topMatParams['is_default_topmat'];

        $logger = \Magento\Framework\App\ObjectManager::getInstance()->get(\Psr\Log\LoggerInterface::class);
        $logger->info('topmat');

        $logger->info(print_r($topMatParams, true));

        if ($configLevel <= 4) {
            if ($selectedMediumOption && $selectedTreatmentOption) {
                if ($hasChangedMediaTreatment) { $logger->info('hasChangedMediaTreatment');
                    if ($requireTopMatForTreatment) {$logger->info('requireTopMatForTreatment');
                        return $this->getFirstMatCondition('topmat', $topMatParams);
                    } else {$logger->info('requireTopMatForTreatment else');
                        //disable topmat
                        return [];
                    }
                } else { $logger->info('default');
                    if ($isDefaultTopMat) { $logger->info('isDefaultTopMat');
                        return $this->getFirstMatCondition('topmat', $topMatParams);
                    } else { $logger->info("isDefaultTopMat else");
                        //disable topmat
                        return [];
                    }
                }
            } else {//disable topmat
                return [];
            }
        }
    }

    public function getBottomMatCalculation($bottomMatParams)
    {
        $logger = \Magento\Framework\App\ObjectManager::getInstance()->get(\Psr\Log\LoggerInterface::class);
        $logger->info('bottommat');
        $logger->info(print_r($bottomMatParams, true));

        $configLevel = $bottomMatParams['config_level'];
        $selectedMediumOption = $bottomMatParams['selected_medium'];
        $selectedTreatmentOption = $bottomMatParams['selected_treatment'];
        $hasChangedMediaTreatment = $bottomMatParams['has_changed_medium_treatment'];
        $requireBottomMatForTreatment = $bottomMatParams['require_bottommat_for_treatment'];
        $isDefaultBottomMat = $bottomMatParams['is_default_bottommat'];

        if ($configLevel <= 4) {
            if ($selectedMediumOption && $selectedTreatmentOption) {
                if ($hasChangedMediaTreatment) { $logger->info('hasChangedMediaTreatment');
                    if ($requireBottomMatForTreatment) { $logger->info('requirebottomMatForTreatment');
                        return $this->getFirstMatCondition('bottommat', $bottomMatParams);
                    } else { $logger->info('requirebottomMatForTreatment else');
                        //disable bottommat
                        return [];
                    }
                } else { $logger->info('default');
                    if ($isDefaultBottomMat) { $logger->info('isDefaultbottomMat');
                        return $this->getFirstMatCondition('bottommat', $bottomMatParams);
                    } else { $logger->info("isDefaultBottomMat else");
                        //disable bottommat
                        return [];
                    }
                }
            } else {//disable bottommat
                return [];
            }
        }
    }

    public function getFirstMatCondition($matTypeOption, $matParams)
    {
        $hasChangedMediaTreatment = $matParams['has_changed_medium_treatment'];
        $hasChangedSizeFrame = $matParams['has_changed_size_frame'];
        $isDefaultTopMat = $matParams['is_default_topmat'];
        $isDefaultBottomMat = $matParams['is_default_bottommat'];
        $width = $matParams['width'];
        $height = $matParams['height'];

        $logger = \Magento\Framework\App\ObjectManager::getInstance()->get(\Psr\Log\LoggerInterface::class);
        $logger->info('getFirstMatCondition');

        $isDefaultMat = ($matTypeOption == 'topmat') ? $isDefaultTopMat : $isDefaultBottomMat;

        $logger->info($isDefaultMat);

        if ($width > 40 && $height > 60) { $logger->info("1 if");
            //display default mat with no op to select
            return $this->getMatArray('default', $matTypeOption, $matParams);
        } else { $logger->info("1 else");
            if ($hasChangedMediaTreatment || $hasChangedSizeFrame) { $logger->info("1 else if");
                return $this->getSecondMatCondition($matTypeOption, $matParams);
            } else { $logger->info("1 else else");
                if ($isDefaultMat) { $logger->info("1 else else if");
                    //display default mat
                    return $this->getMatArray('default', $matTypeOption, $matParams);
                } else { $logger->info("1 else else else");
                    return $this->getSecondMatCondition($matTypeOption, $matParams);
                }
            }
        }

    }

    public function getSecondMatCondition($matTypeOption, $matParams)
    {
        $width = $matParams['width'];
        $height = $matParams['height'];

        $logger = \Magento\Framework\App\ObjectManager::getInstance()->get(\Psr\Log\LoggerInterface::class);
        $logger->info('getSecondMatCondition');

        if ($width > 32 && $height > 40) { $logger->info('2 if');
            return $this->getMatArray('oversized', $matTypeOption, $matParams);
        } else { $logger->info('2 else');
            return $this->getMatArray('standard', $matTypeOption, $matParams);
        }
    }

    public function getMatArray($type, $matTypeOption, $matParams)
    {
        $matArray = [];
        $type = trim($type);
        $isDefaultMatArray = false;

        $logger = \Magento\Framework\App\ObjectManager::getInstance()->get(\Psr\Log\LoggerInterface::class);
        $logger->info('getMatArray');

        $isDefaultTopMatSku = $matParams['is_default_topmat_sku'];
        $isDefaultBottomMatSku = $matParams['is_default_bottommat_sku'];
        $defaultMatSku = ($matTypeOption == 'topmat') ? $isDefaultTopMatSku : $isDefaultBottomMatSku;
        //$matData = Array(["sku" => 'B97', "mat_type" => 'oversized'], ["sku" => 'B8-97', "mat_type" => 'standard'], ["sku" => 'B98', "mat_type" => 'standard']);
        $matData = $this->getMatCollection();

        foreach ($matData as $key => $data) {

            $matType = trim($data['m_mat_type']);
            if (strtolower($matType) == $type) {
                $matArray[] = $data;
            }

            if ($type == 'default' && $defaultMatSku == trim($data['m_sku'])) {
                $matArray = [];
                $matArray = $data;
                $isDefaultMatArray = true;
                $logger->info("if");
               // $logger->info(print_r($matArray, true));
                return $matArray;
            }
        }

        if($type == 'default' && !$isDefaultMatArray){  $logger->info("empty");
            return [];
        }

       // $logger->info(print_r($matArray, true));
        return $matArray;
    }

    public function getLinerCalculation($linerParams)
    {
        $configLevel = $linerParams['config_level'];
        $selectedMediumOption = $linerParams['selected_medium'];
        $selectedTreatmentOption = $linerParams['selected_treatment'];
        $selectedFrameSku = $linerParams['selected_frame_sku'];
        $hasChangedMediaTreatment = $linerParams['has_changed_medium_treatment'];
        $hasChangedSizeFrame = $linerParams['has_changed_size_frame'];
        $requireLinerForTreatment = $linerParams['require_liner_for_treatment'];
        $frameType = $linerParams['frame_type'];
        $frameType = strtolower($frameType);
        $isDefaultLiner = $linerParams['is_default_liner'];
        $frameRabbetDepth = $linerParams['frame_rabbet_depth'];
        $minRabbetDepth = $linerParams['min_rabbet_depth'];
        $linerRabbetDepthCheck = $linerParams['liner_rabbet_depth_check'];
        $defaultLinerSku = $linerParams['default_liner_sku'];

        $logger = \Magento\Framework\App\ObjectManager::getInstance()->get(\Psr\Log\LoggerInterface::class);
        $logger->info('start');

        $logger->info(print_r($linerParams, true));

        if ($configLevel < 4) {
            if ($selectedMediumOption && $selectedTreatmentOption && $selectedFrameSku != "No Frame") {
                if ($hasChangedMediaTreatment) {
                    if ($requireLinerForTreatment && $frameType == 'standard') { $logger->info("change pass");
                        return $this->getLinerArray('custom', $linerRabbetDepthCheck, $minRabbetDepth, $frameRabbetDepth, $defaultLinerSku);
                    } else { $logger->info("change fail");
                        //disable liner
                        return [];
                    }
                } else {
                    $logger->info("nochange ");
                    if ($isDefaultLiner) {  $logger->info("isDefaultLiner ");
                        if ($hasChangedSizeFrame) { $logger->info("sizechange ");
                            $logger->info($frameType);
                            if ($frameType == 'standard') { $logger->info(" select");
                                return $this->getLinerArray('custom', $linerRabbetDepthCheck, $minRabbetDepth, $frameRabbetDepth, $defaultLinerSku);
                            } else { $logger->info("nosizechange ");
                                //disable liner
                                return [];
                            }
                        } else { $logger->info("no size change");
                            //show default liner
                            return $this->getLinerArray('default', $linerRabbetDepthCheck, $minRabbetDepth, $frameRabbetDepth, $defaultLinerSku);
                        }
                    } else { $logger->info("no isDefaultLiner");
                        //disable liner
                        return [];
                    }
                }
            } else { $logger->info("undefined");
                //disable liner
                return [];
            }
        } else { $logger->info("undefined");
            //disable liner
            return [];
        }
    }

    public function getLinerArray($type, $linerRabbetDepthCheck, $minRabbetDepth, $frameRabbetDepth, $defaultLinerSku){
        $type = trim($type);
        $linerArray = [];

//        $linerData = array(
//            0 =>
//                array(
//                    "sku" => 'L0023',
//                    "name" => 'Liner L0023',
//                    "type" => 'Liner',
//                    "depth" => 1.375,
//                    //"depth" => 0.75,
//                    "rabbet_depth" => 0.375,
//                    "color" => 'Antique Gold',
//                    "color_family" => 'Gold Family'
//                ),
//            1 =>
//                array(
//                    "sku" => 'L0004',
//                    "name" => 'Liner L0004',
//                    "type" => 'Liner',
//                    "depth" => 0.56,
//                    "rabbet_depth" => 0.25,
//                    "color" => 'Antique Gold test3',
//                    "color_family" => 'Gold test3'
//                ),
//            2 =>
//                array(
//                    "sku" => 'L00013',
//                    "name" => 'Liner L00013',
//                    "type" => 'Liner',
//                    "depth" => 0.68,
//                    "rabbet_depth" => 0.25,
//                    "color" => 'Antique Gold test3',
//                    "color_family" => 'Gold test3'
//                ));

        $linerData = $this->getLinerCollection();

        $logger = \Magento\Framework\App\ObjectManager::getInstance()->get(\Psr\Log\LoggerInterface::class);
        $logger->info('test');
       // $logger->info(print_r(count($linerData), true));

        foreach($linerData as $key => $data) {
            $linerHeight = $data['m_liner_depth'];
            $linerRabbetDepth = $data['m_liner_rabbet_depth'];

            $linerCheck = 0;

            if ($linerRabbetDepthCheck) {
                if (($linerRabbetDepth >= $minRabbetDepth)) {
                    $linerCheck = 1;
                }
            } else {
                $linerCheck = 1;
            }

            if ($type == 'default') {
                $linerArray = [];
                if ($defaultLinerSku == $data['m_sku']) {
                    $linerArray = $data;
                    $logger->info("if");
                   // $logger->info(print_r($linerArray, true));
                    return $linerArray;
                } else {
                    $logger->info("else");
                    return [];
                }
            }

            if (($linerHeight <= $frameRabbetDepth) && ($linerCheck) && (($linerHeight - $linerRabbetDepth + $minRabbetDepth) <= $frameRabbetDepth)) {
                $linerArray[] = $data;

            }
        }// $logger->info(print_r($linerArray, true));
        return $linerArray;
    }

    public function getMatCollection()
    {
        $optionId = $this->eavConfig->getAttribute('catalog_product', 'mat_type')->getSource()->getOptionId('Standard');
        $productCollection = $this->getProductCollection('Mat', 'mat_type', $optionId);

        $finalProducts = array();
        foreach ($productCollection as $item) {
            $finalProduct['m_sku'] = $item->getSku();
            $finalProduct['m_name'] = $item->getName();
            $finalProduct['m_status'] = $item->getStatus();
            $finalProduct['m_mat_type'] = $this->getAttributeValue($item, 'mat_type');
            $finalProduct['m_color_mat'] = $item->getColorMat();
            $finalProduct['m_color_family'] = $item->getColorMatFamily();
            $finalProduct['m_filter_thickness'] = $item->getFilterThickness();
            $finalProducts[] = $finalProduct;
        }
        return $finalProducts;
    }

    public function getLinerCollection()
    {
        $optionId = $this->eavConfig->getAttribute('catalog_product', 'frame_type')->getSource()->getOptionId('Standard');
        $productCollection = $this->getProductCollection('Frame', 'frame_type', $optionId);
        $finalProducts = array();
        foreach ($productCollection as $item) {
            $finalProduct['m_sku'] =  $item->getSku();
            $finalProduct['m_name'] =  $item->getName();
            $finalProduct['m_liner_type'] =  $this->getAttributeValue($item, 'frame_type');
            $finalProduct['m_liner_depth'] =  $item->getFrameWidth();
            $finalProduct['m_liner_rabbet_depth'] =  $item->getFrameRabbetDepth();
            $finalProduct['m_color_liner'] =  $this->getAttributeValue($item, 'color_frame');
            $finalProduct['m_color_family'] =  $this->getAttributeValue($item, 'color_family_frame');
            $finalProducts[] = $finalProduct;
        }
        return $finalProducts;
    }

    public function getProductCollection($attrSetName, $attrCode, $optionId)
    {
        $attributeSetCollection = $this->eavCollectionFactory->create();
        $attributeSetCollection->addFieldToFilter('entity_type_id', 4)->addFieldToFilter('attribute_set_name', $attrSetName);
        $attrSet = current($attributeSetCollection->getData());
        $attributeSetId = $attrSet["attribute_set_id"];
    
        $productCollection = $this->productCollectionFactory->create();
        $productCollection->addAttributeToSelect('attribute_set_id', $attributeSetId)->addAttributeToFilter($attrCode, $optionId)->addAttributeToSelect("*");
        return $productCollection;
    }

    public function getAttributeValue($product, $attrCode)
    {
        $productFactory = $this->productFactory->create()->load($product->getId());
        return $productFactory->getResource()->getAttribute($attrCode)->getFrontend()->getValue($productFactory);
    }

    public function getMediaData($selectedMediumOption)
    {
        $connection = $this->resourceConnection->getConnection();
        $query = "SELECT * FROM media where sku='paper_matte'";
        return $connection->fetchAll($query);
    }

    public function getTreatmentData($selectedTreatmentOption)
    {
        $connection = $this->resourceConnection->getConnection();
        $query = "SELECT * FROM treatment where treatment_sku='deck_top_bot_hf_sbox'";
        return $connection->fetchAll($query);
    }

    public function getSizeCalculation($selectedMediumOption, $selectedTreatmentOption)
    {
        //start:TODO
        //get from artwork table
        $m_top_mat_default_sku = '';
        $m_bottom_mat_default_sku = '';
        $glassWidth = 22;
        $glassHeight = 28;
        $m_max_image_width = 30;
        $m_max_image_height = 50;
        //end:TODO

        $m_min_image_size_short = 0;
        $m_min_image_size_long = 0;
        $m_max_image_size_short = 0;
        $m_max_image_size_long = 0;

        $m_requires_top_mat = 0;
        $m_requires_bottom_mat = 0;
        $m_min_glass_size_short = 0;
        $m_min_glass_size_long = 0;
        $m_max_glass_size_short = 0;
        $m_max_glass_size_long = 0;


        $mediaInfo = $this->getMediaData($selectedMediumOption);

        foreach ($mediaInfo as $media){
            //get from media table
            $m_min_image_size_short = $media['min_image_size_short'];
            $m_min_image_size_long = $media['min_image_size_long'];
            $m_max_image_size_short = $media['max_image_size_short'];
            $m_max_image_size_long = $media['max_image_size_long'];
        }

        $treatmentInfo = $this->getTreatmentData($selectedTreatmentOption);
        foreach ($treatmentInfo as $treatment){
            //get from treatment table
            $m_requires_top_mat = $treatment['requires_top_mat'];
            $m_requires_bottom_mat = $treatment['requires_bottom_mat'];
            $m_min_glass_size_short = $treatment['min_glass_size_short'];
            $m_min_glass_size_long = $treatment['min_glass_size_long'];
            $m_max_glass_size_short = $treatment['max_glass_size_short'];
            $m_max_glass_size_long = $treatment['max_glass_size_short'];
        }

        /*
          //get from media table
          $m_min_image_size_short = 6;
          $m_min_image_size_long = 6;
          $m_max_image_size_short = 44;
          $m_max_image_size_long = 96;

        //get from treatment table
        $m_requires_top_mat = 0;
        $m_requires_bottom_mat = 1;
        $m_min_glass_size_short = 6;
        $m_min_glass_size_long = 6;
        $m_max_glass_size_short = 46;
        $m_max_glass_size_long = 94;*/



        $imageProportionRange = [];

        if (($m_top_mat_default_sku == '' && $m_bottom_mat_default_sku == '') || ($m_requires_top_mat  == 0 && $m_requires_bottom_mat == 0)) {
            $imageHeight = $glassWidth;
            $imageWidth = $glassHeight;
            $productMaxImageWidth = $m_max_image_width;
            $productMaxImageHeight = $m_max_image_height;
            $imageShortSide = min($imageWidth, $imageHeight);
            $imageLongSide = max($imageWidth, $imageHeight);
            $productGlassSizeShort = min($glassWidth, $glassHeight);
            $productGlassSizeLong = max($glassWidth, $glassHeight);
            $imgSizeFromProduct = $this->getImgSizeFromProduct($imageWidth, $imageHeight, $productMaxImageWidth, $productMaxImageHeight);
            $maxImgSizeFromMedia = $this->getMaxImgSizeFromMedia($imageShortSide, $imageLongSide, $m_max_image_size_short, $m_max_image_size_long);
            $minImgSizeFromMedia = $this->getMinImgSizeFromMedia($imageShortSide, $imageLongSide, $m_min_image_size_short, $m_min_image_size_long);
            $maxGlassSizeFromTreatment = $this->getMaxGlassSizeFromTreatment($productGlassSizeShort, $productGlassSizeLong, $m_max_glass_size_short, $m_max_glass_size_long);
            $minGlassSizeFromTreatment = $this->getMinGlassSizeFromTreatment($productGlassSizeShort, $productGlassSizeLong, $m_min_glass_size_short, $m_min_glass_size_long);

            if ($imgSizeFromProduct && $maxImgSizeFromMedia && $minImgSizeFromMedia && $maxGlassSizeFromTreatment && $minGlassSizeFromTreatment) {
                $imageProportionRange = $this->getImageProportionRange("nomat", $selectedMediumOption, $selectedTreatmentOption);
            }

        } else {
            $imageProportionRange = $this->getImageProportionRange("normal", $selectedMediumOption, $selectedTreatmentOption);
        }
        return $imageProportionRange;
    }

    public function getImgSizeFromProduct($imageWidth, $imageHeight, $productMaxImageWidth, $productMaxImageHeight)
    {
        if ($imageWidth <= $productMaxImageWidth && $imageHeight <= $productMaxImageHeight) {
            return true;
        }
        return false;
    }

    public function getMaxImgSizeFromMedia($imageShortSide, $imageLongSide, $m_max_image_size_short, $m_max_image_size_long)
    {
        if ($imageShortSide <= $m_max_image_size_short && $imageLongSide <= $m_max_image_size_long) {
            return true;
        }
        return false;
    }

    public function getMinImgSizeFromMedia($imageShortSide, $imageLongSide, $m_min_image_size_short, $m_min_image_size_long)
    {
        if ($imageShortSide >= $m_min_image_size_short && $imageLongSide >= $m_min_image_size_long) {
            return true;
        }
        return false;
    }

    public function getMaxGlassSizeFromTreatment($productGlassSizeShort, $productGlassSizeLong, $m_max_glass_size_short, $m_max_glass_size_long)
    {
        if ($productGlassSizeShort <= $m_max_glass_size_short && $productGlassSizeLong <= $m_max_glass_size_long) {
            return true;
        }
        return false;
    }

    public function getMinGlassSizeFromTreatment($productGlassSizeShort, $productGlassSizeLong, $m_min_glass_size_short, $m_min_glass_size_long)
    {
        if ($productGlassSizeShort >= $m_min_glass_size_short && $productGlassSizeLong >= $m_min_glass_size_long) {
            return true;
        }
        return false;
    }

    public function getImageProportionRange($type, $selectedMediumOption, $selectedTreatmentOption)
    {
        $plusSizeRatio = 0;
        $minusSizeRatio = 0;
        $percentageOfSize = 0.02;
        $isVerticalOrientation = 0;

        //start:TODO
        $orientation = 'vertical';
        $mediumTabJson = $this->getArray($selectedMediumOption, $selectedTreatmentOption);

        if(isset($mediumTabJson['media']) && array_key_exists($selectedMediumOption, $mediumTabJson['media'])) {
            //
            $jsonOfBaseCost = $mediumTabJson['media'][$selectedMediumOption]['treatment'][$selectedTreatmentOption]['basecost'];
        } else{
            return ['18×24'];

        }

        //print_r($mediumTabJson);
        $m_image_height = 24;
        $m_image_width = 18;
        //end:TODO

        if (strtolower($orientation) == 'vertical' && isset($m_image_height) && $m_image_height > 0 && isset($m_image_width) && $m_image_width > 0) {
            $sizeRatio = $m_image_height / $m_image_width;
            $isVerticalOrientation = 1;
        }
        if (strtolower($orientation) == 'horizontal' && isset($m_image_height) && $m_image_height > 0 && isset($m_image_width) && $m_image_width > 0) {
            $sizeRatio = $m_image_width / $m_image_height;
        }

        if ($type == "nomat") {
            $percentageOfSize = $sizeRatio * 0.02;
        }
        $plusSizeRatio = $sizeRatio + $percentageOfSize;
        $minusSizeRatio = $sizeRatio - $percentageOfSize;

        //round of values
        $plusSizeRatio = round($plusSizeRatio, 4);
        $minusSizeRatio = round($minusSizeRatio, 4);

        /*if($selectedMediumOption == '' && $selectedTreatmentOption == '') {
            $jsonOfBaseCost = $mediumTabJson['media']['papper_matte']['treatment']['deck_top_bot_hf_sbox']['basecost'];
        }else{
            if(empty($mediumTabJson['media'])){
                $jsonOfBaseCost = $mediumTabJson['media']['papper_matte']['treatment']['deck_top_bot_hf_sbox']['basecost'];
            }else {
                $jsonOfBaseCost = $mediumTabJson['media'][$selectedMediumOption]['treatment'][$selectedTreatmentOption]['basecost'];
            }
        }*/

        $baseCostRationArray = [];
        $finalBaseCostArray = [];
        foreach ($jsonOfBaseCost as $key => $val) {
            $glassSizeLong = $val['glass_size_long'];
            $glassSizeShort = $val['glass_size_short'];

            if ($glassSizeLong > 0 && $glassSizeShort > 0) {
                if ($isVerticalOrientation == 1) {
                    $glassSize = $glassSizeLong / $glassSizeShort;
                } else {
                    $glassSize = $glassSizeShort / $glassSizeLong;
                }
                $glassSize = round($glassSize, 4);
            }
            $baseCostArray['size'] = $glassSizeShort . '×' . $glassSizeLong;
            $baseCostArray['size_ratio'] = $glassSize;
            $baseCostRationArray[] = $baseCostArray;
        }

        foreach ($baseCostRationArray as $key => $val) {
            if ($val['size_ratio'] >= $minusSizeRatio && $val['size_ratio'] <= $plusSizeRatio) {
                $finalBaseCostArray[] = $val['size'];
            }
        }
        return $finalBaseCostArray;
    }

    public function getArray($selectedMediumOption, $selectedTreatmentOption)
    {
        $connection = $this->resourceConnection->getConnection();
        //$query = "SELECT base_cost.*,media.sku,t.treatment_sku FROM media join base_cost on media.base_cost_media = base_cost.base_cost_media join treatment as t on t.base_cost_treatment = base_cost.base_cost_treatment where media.sku='paper_matte' and t.treatment_sku='deck_top_bot_hf_sbox'";
        if($selectedMediumOption != '' && $selectedTreatmentOption != ''){
            $query = "SELECT base_cost.*,media.sku,t.treatment_sku FROM media join base_cost on media.base_cost_media = base_cost.base_cost_media join treatment as t on t.base_cost_treatment = base_cost.base_cost_treatment where media.sku='".$selectedMediumOption."' and t.treatment_sku='".$selectedTreatmentOption."'";
        }else{
            $query = "SELECT base_cost.*,media.sku,t.treatment_sku FROM media join base_cost on media.base_cost_media = base_cost.base_cost_media join treatment as t on t.base_cost_treatment = base_cost.base_cost_treatment where media.sku='paper_matte' and t.treatment_sku='deck_top_bot_hf_sbox'";
        }
        $baseCostItems = $connection->fetchAll($query);
        //print_r($baseCostItems);
        $result = [];
        if(is_array($baseCostItems)){
            if(!empty($baseCostItems)){
                foreach ($baseCostItems as $baseCostItem){
                    if(array_key_exists($baseCostItem['sku'],$result)){
                        $result[$baseCostItem['sku']]['treatment'][$baseCostItem['treatment_sku']]['basecost'][] = [
                            'base_cost_id' => $baseCostItem['base_cost_id'],
                            'base_cost_media' => $baseCostItem['base_cost_media'],
                            'base_cost_treatment' => $baseCostItem['base_cost_treatment'],
                            'glass_size_short' => (int)$baseCostItem['glass_size_short'],
                            'glass_size_long' => (int)$baseCostItem['glass_size_long'],
                            'base_cost' => $baseCostItem['base_cost'],
                        ];
                    }else{
                        $result[$baseCostItem['sku']]=[
                              'treatment' => [
                                  $baseCostItem['treatment_sku']=>[
                                      'basecost' =>[
                                      0 => [
                                          'base_cost_id' => $baseCostItem['base_cost_id'],
                                          'base_cost_media' => $baseCostItem['base_cost_media'],
                                          'base_cost_treatment' => $baseCostItem['base_cost_treatment'],
                                          'glass_size_short' => (int)$baseCostItem['glass_size_short'],
                                          'glass_size_long' => (int)$baseCostItem['glass_size_long'],
                                          'base_cost' => $baseCostItem['base_cost'],
                                      ]
                                ]
                              ]
                            ]
                        ];
                    }
                }
            }
        }
        $finalResult = [];
        $finalResult['media'] = $result;
        return $finalResult;
    }

    public function getArrayOld()
    {

        return $array = array(
            'media' =>
                array(
                    'papper_matte' =>
                        array(
                            'treatment' =>
                                array(
                                    'deck_top_bot_hf_sbox' =>
                                        array(
                                            'basecost' =>
                                                array(
                                                    0 =>
                                                        array(
                                                            'base_cost_id' => '1',
                                                            'base_cost_media' => 'media1',
                                                            'base_cost_treatment' => 'treatment1',
                                                            'glass_size_short' => 6,
                                                            'glass_size_long' => 8,
                                                            'base_cost' => '45.0000',
                                                        ),
                                                    1 =>
                                                        array(
                                                            'base_cost_id' => '2',
                                                            'base_cost_media' => 'media2',
                                                            'base_cost_treatment' => 'treatment2',
                                                            'glass_size_short' => 9,
                                                            'glass_size_long' => 12,
                                                            'base_cost' => '80.0000',
                                                        ),
                                                    2 =>
                                                        array(
                                                            'base_cost_id' => '2',
                                                            'base_cost_media' => 'media2',
                                                            'base_cost_treatment' => 'treatment2',
                                                            'glass_size_short' => 12,
                                                            'glass_size_long' => 16,
                                                            'base_cost' => '80.0000',
                                                        ),
                                                    3 =>
                                                        array(
                                                            'base_cost_id' => '2',
                                                            'base_cost_media' => 'media2',
                                                            'base_cost_treatment' => 'treatment2',
                                                            'glass_size_short' => 15,
                                                            'glass_size_long' => 20,
                                                            'base_cost' => '80.0000',
                                                        ),
                                                    4 =>
                                                        array(
                                                            'base_cost_id' => '2',
                                                            'base_cost_media' => 'media2',
                                                            'base_cost_treatment' => 'treatment2',
                                                            'glass_size_short' => 17,
                                                            'glass_size_long' => 23,
                                                            'base_cost' => '80.0000',
                                                        ),
                                                    5 =>
                                                        array(
                                                            'base_cost_id' => '2',
                                                            'base_cost_media' => 'media2',
                                                            'base_cost_treatment' => 'treatment2',
                                                            'glass_size_short' => 18,
                                                            'glass_size_long' => 24,
                                                            'base_cost' => '80.0000',
                                                        ),
                                                    6 =>
                                                        array(
                                                            'base_cost_id' => '2',
                                                            'base_cost_media' => 'media2',
                                                            'base_cost_treatment' => 'treatment2',
                                                            'glass_size_short' => 21,
                                                            'glass_size_long' => 28,
                                                            'base_cost' => '80.0000',
                                                        ),
                                                    7 =>
                                                        array(
                                                            'base_cost_id' => '2',
                                                            'base_cost_media' => 'media2',
                                                            'base_cost_treatment' => 'treatment2',
                                                            'glass_size_short' => 24,
                                                            'glass_size_long' => 32,
                                                            'base_cost' => '80.0000',
                                                        ),
                                                    8 =>
                                                        array(
                                                            'base_cost_id' => '2',
                                                            'base_cost_media' => 'media2',
                                                            'base_cost_treatment' => 'treatment2',
                                                            'glass_size_short' => 27,
                                                            'glass_size_long' => 36,
                                                            'base_cost' => '80.0000',
                                                        ),
                                                    9 =>
                                                        array(
                                                            'base_cost_id' => '2',
                                                            'base_cost_media' => 'media2',
                                                            'base_cost_treatment' => 'treatment2',
                                                            'glass_size_short' => 30,
                                                            'glass_size_long' => 40,
                                                            'base_cost' => '80.0000',
                                                        ),
                                                    10 =>
                                                        array(
                                                            'base_cost_id' => '2',
                                                            'base_cost_media' => 'media2',
                                                            'base_cost_treatment' => 'treatment2',
                                                            'glass_size_short' => 33,
                                                            'glass_size_long' => 44,
                                                            'base_cost' => '80.0000',
                                                        ),
                                                    11 =>
                                                        array(
                                                            'base_cost_id' => '2',
                                                            'base_cost_media' => 'media2',
                                                            'base_cost_treatment' => 'treatment2',
                                                            'glass_size_short' => 36,
                                                            'glass_size_long' => 48,
                                                            'base_cost' => '80.0000',
                                                        ),
                                                    12 =>
                                                        array(
                                                            'base_cost_id' => '2',
                                                            'base_cost_media' => 'media2',
                                                            'base_cost_treatment' => 'treatment2',
                                                            'glass_size_short' => 39,
                                                            'glass_size_long' => 52,
                                                            'base_cost' => '80.0000',
                                                        ),

                                                ),
                                        ),
                                ),
                        ),
                ),
        );
    }//10 13, 12 16, 16 21, 17 23, 24 18,25 19, 26 20,  27 20, 28 21, 29 22,  30 23

    // public function getJson(){
//        $apiUrl = "https://wendoveruat-m2.perficientdcsdemo.com/rest/V1/artrules/";
//        $ch = curl_init();
//        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
//        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
//        curl_setopt($ch, CURLOPT_URL, $apiUrl);
//        curl_setopt($ch, CURLOPT_HTTPHEADER, [
//            'Content-Type: application/json',
//            'Authorization: Bearer gtas4zsxg9ytr5p2m7kwjfpwhlw59sf4'
//        ]);
//        $result = curl_exec($ch);
//        curl_close($ch);
//        $MediumTabJson = json_decode($result, true);
    //   }

//    public function getSizeRatioSeries()
//    {
//
//        $artworkTableImageWidth = 18;
//        $artworkTableImageHeight = 24;
//        $mediaTableMinWidth = 6;
//        $mediaTableMaxWidth = 44;
//        $mediaTableMinHeight = 6;
//        $mediaTableMaxHeight = 96;
//
//        $midNum = 0;
//        $ratioArray = [];
//        $ratioSeries = [];
//
//        if ($artworkTableImageWidth != $artworkTableImageHeight) {
//            if ($artworkTableImageWidth < $artworkTableImageHeight) {
//                $midNum = ($artworkTableImageWidth % 2 == 0) ? $artworkTableImageWidth / 2 : ($artworkTableImageWidth - 1) / 2;
//            } else {
//                $midNum = ($artworkTableImageHeight % 2 == 0) ? $artworkTableImageHeight / 2 : ($artworkTableImageHeight - 1) / 2;
//            }
//
//            $divisibleFactor = $this->findMaxDivisor($artworkTableImageWidth, $artworkTableImageHeight, $midNum);
//            $divisibleFactor = array_reverse($divisibleFactor);
//            $divisibleFactor = array_shift($divisibleFactor);
//            $largeNumber = $divisibleFactor;
//
//
//            if ($artworkTableImageWidth > $artworkTableImageHeight) {
//                //width : height
//                $currWidth = $artworkTableImageWidth / $largeNumber;
//                $currHeight = $artworkTableImageHeight / $largeNumber;
//
//                $currMediaTableStartWidth = $mediaTableMinWidth % $currWidth == 0 ? $mediaTableMinWidth / $currWidth : ((int)($mediaTableMinWidth / $currWidth) + 1);
//                array_push($ratioArray, $currWidth);
//                array_push($ratioArray, $currHeight);
//                $ratioSeries = $this->buildRatioSeries($ratioArray, $currMediaTableStartWidth, $mediaTableMaxWidth);
//            } else {
//                $currWidth = $artworkTableImageWidth / $largeNumber;
//                $currHeight = $artworkTableImageHeight / $largeNumber;
//
//                $currMediaTableStartHeight = $mediaTableMinHeight % $currHeight == 0 ? $mediaTableMinHeight / $currHeight : ((int)($mediaTableMinHeight / $currHeight) + 1);
//                array_push($ratioArray, $currHeight);
//                array_push($ratioArray, $currWidth);
//
//                $ratioSeries = $this->buildRatioSeries($ratioArray, $currMediaTableStartHeight, $mediaTableMaxHeight);
//            }
//        } else {
//            array_push($ratioArray, 1);
//            array_push($ratioArray, 1);
//            $ratioSeries = $this->buildRatioSeries($ratioArray, 1, $mediaTableMaxHeight);
//        }
//
//        return $ratioSeries;
//    }
//
//    public function findMaxDivisor($num1, $num2, $midNum)
//    {
//        $arr = [];
//        for ($i = 2; $i <= $midNum; $i++) {
//            if ($num1 % $i == 0 && $num2 % $i == 0) {
//                array_push($arr, $i);
//            }
//        }
//
//        return $arr;
//    }
//
//    public function buildRatioSeries($ratioArray, $startValue, $endValue)
//    {
//        $ratioSeries = [];
//
//        $inc = 0;
//        $i = 0;
//        for ($i = $startValue; $i <= ($endValue / $ratioArray[0]); $i++) {
//            $firstNum = $ratioArray[0] * $i;
//            $secondNum = $ratioArray[1] * $i;
//            $elem = $secondNum . '×' . $firstNum;
//            array_push($ratioSeries, $elem);
//            $inc++;
//
//        }
//        return $ratioSeries;
//    }

//    public function gettest()
//    {
//        $objectManager = \Magento\Framework\App\ObjectManager::getInstance();
//        $attrSetName = 'Default';
//        $attribute_set_factoryCollection = $objectManager->get('\Magento\Eav\Model\ResourceModel\Entity\Attribute\Set\CollectionFactory');
//        $attribute_set_collection = $attribute_set_factoryCollection->create();
//        $attribute_set_collection
//            ->addFieldToFilter('entity_type_id', 4)
//            ->addFieldToFilter('attribute_set_name', $attrSetName);
//        $att_set = current($attribute_set_collection->getData());
//        $attribute_set_id = $att_set["attribute_set_id"];
//        $factoryCollection = $objectManager->get('\Magento\Catalog\Model\ResourceModel\Product\CollectionFactory');
//        $collection = $factoryCollection->create();
//        $collection->addFieldToSelect("name");
//        $collection->addFieldToFilter('attribute_set_id', $attribute_set_id);
//        $productsName = array();
//        foreach ($collection as $item) {
//            $productsName[] = $item->getName();
//        }
//        print_r($productsName);
//    }
}