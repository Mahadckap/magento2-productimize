<?php
/**
 * @author     DCKAP <extensions@dckap.com>
 * @package    DCKAP_Productimize
 * @copyright  Copyright (c) 2017 DCKAP Inc (http://www.dckap.com)
 * @license    http://opensource.org/licenses/osl-3.0.php  Open Software License (OSL 3.0)
 */

namespace Mahadckap\Productimize\Controller\Index;

use Magento\Framework\App\Action\Action;
use Magento\Framework\App\Action\Context;
use Magento\Framework\View\Result\PageFactory;
use Magento\Framework\Registry;
use Magento\Catalog\Model\Product;
use Mahadckap\Productimize\Model\ProductimizeCalculation;

//use DCKAP\Productimize\Helper\Data;
use Magento\Framework\App\ResourceConnection;

use Magento\Framework\Controller\ResultFactory;
use Magento\Framework\App\ResponseInterface;

/**
 * Class Index
 * @package DCKAP\Productimize\Controller\Index
 */
class Index extends Action
{

    /**
     * @var \Magento\Framework\View\Result\PageFactory
     */
    protected $resultPageFactory;


    protected $resultFactory;
    /**
     * @var $coreRegistry
     */
    protected $coreRegistry;
    /**
     * @var ResourceConnection
     */
    protected $resourceConnection;

    /**
     * Index constructor.
     * @param Context $context
     * @param \Magento\Framework\View\Result\PageFactory $resultPageFactory
     * @param \Magento\Framework\Registry $coreRegistry
     * @param \Mahadckap\Productimize\Helper\Data $helperData
     */
    public function __construct(Context $context,
                                PageFactory $resultPageFactory,
                                Registry $coreRegistry,
                                Product $product,
                                ProductimizeCalculation $productimizeCalculation,
                                ResourceConnection $resourceConnection

    )
    {
        $this->_coreRegistry = $coreRegistry;
        $this->resultPageFactory = $resultPageFactory;
        // $this->helperData = $helperData;
        $this->product = $product;
        $this->productimizeCalculation = $productimizeCalculation;
        $this->resultFactory = $context->getResultFactory();
        parent::__construct($context);
        $this->resourceConnection = $resourceConnection;
    }

    /**
     * @return \Magento\Framework\App\ResponseInterface|\Magento\Framework\View\Result\Page
     */
    public function executeOLD()
    {

        $productId = $this->getRequest()->getParam('product');
        // $attributes = $this->getRequest()->getParam('optAttributes');
        // $selectedAttributes = $this->getRequest()->getParam('selectedAttributes');

        if ($this->getRequest()->getParam('isAjax')) {

            $product = $this->product->load(2047);


            $attrPrice = 0;

            /*if ($product->getTypeId() == 'configurable') {


                $_children = $product->getTypeInstance()->getUsedProducts($product);
                if (isset($_children) && isset($selectedAttributes)) {
                    foreach ($_children as $child) {

                        $attrInc = 0;
                        foreach ($selectedAttributes as $attrCode => $attrValue) {

                            if ($child[$attrCode] == $attrValue) {
                                $attrInc++;
                            }
                        }
                        if ($attrInc == count($selectedAttributes)) {
                            //print_r($child->debug());
                            $attrPrice = $child->getPrice();
                            break;
                        }
                    }
                }
            }*/

            $resultPage = $this->resultPageFactory->create();
            $blockInstance = $resultPage->getLayout()->getBlock('productimize.home')
                ->setData('product_ids', $productId)
                ->setData('productData', $product)
                //->setData('attributePrice', $attrPrice)
                //->setData('promize_id', $proCustomId)
                ->toHtml();
            // call api for getting customize page response
            $url = 'https://wendoveruat-m2.perficientdcsdemo.com/rest/V1/artrules/';
            // Initializes a new cURL session
            $curl = curl_init($url);

            curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
            // Set custom headers for RapidAPI Auth and Content-Type header
            curl_setopt($curl, CURLOPT_HTTPHEADER, [
                'Content-Type: application/json',
                'Authorization: Bearer gtas4zsxg9ytr5p2m7kwjfpwhlw59sf4'
            ]);
            $response = curl_exec($curl);
            $httpcode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
            curl_close($curl);

            //echo "<pre>";print_r($response); echo "</pre>";
            // formatting to our required format begins
            if ($httpcode == 200) {
                $decodedData = json_decode($response);
                $media = $treatment = $mediatreatment = $frametreatment = [];
                if (isset($decodedData) && !empty($decodedData)) {
                    foreach ($decodedData['0']->items as $data) {
                        if ($data->table == 'media') {
                            $media = $data->data;
                        }
                        if ($data->table == 'treatment') {
                            $treatment = $data->data;
                        }
                        if ($data->table == 'media_treatment') {
                            $mediatreatment = $data->data;
                        }
                        if ($data->table == 'frame_treatment') {
                            $frametreatment = $data->data;
                        }
                    }
                }
            }
            $mediafinalArray = [];
            $treatmentfinalArray = [];
            $mediatreatmentfinalArray = [];
            $treatframeArray = [];
            foreach ($treatment as $treatmentitem) {
                $treatmentfinalArray[$treatmentitem->treatment_sku] = (array)$treatmentitem;
            }
            // final frame array
            foreach ($frametreatment as $frametreatmentitem) {
                $treatframeArray[$frametreatmentitem->treatment_sku][$frametreatmentitem->frame_type] = (array)$frametreatmentitem;
            }
            foreach ($mediatreatment as $mediatreatitem) {
                $mediatreatmentfinalArray[$mediatreatitem->media_sku] = (array)$mediatreatitem;
                $mediareltreat[$mediatreatitem->treatment_sku] = $treatmentfinalArray[$mediatreatitem->treatment_sku];
                $mediareltreat[$mediatreatitem->treatment_sku]['display_to_customer'] = $mediatreatitem->display_to_customer;
                // need to merge frames here
                $mediareltreat[$mediatreatitem->treatment_sku]['frames'] = (isset($treatframeArray[$mediatreatitem->treatment_sku])) ? $treatframeArray[$mediatreatitem->treatment_sku] : [];
                $mediatreatmentfinalArray[$mediatreatitem->media_sku]['treatment'] = $mediareltreat;
            }
            foreach ($media as $mediaitem) {
                $mediafinalArray[$mediaitem->sku] = (array)$mediaitem;
                $mediafinalArray[$mediaitem->sku]['treatment'] = (isset($mediatreatmentfinalArray[$mediaitem->sku]['treatment'])) ? $mediatreatmentfinalArray[$mediaitem->sku]['treatment'] : [];
            }

            // formatted data ends
            //$this->productimizeCalculation->gettest();
            //$sizeDetail = $this->productimizeCalculation->getSizeCalculation('papper_matte','deck_top_bot_hf_sbox');
            //$mediafinalArray['size'] = $sizeDetail;


            //need to remove object manager for frame
            /*
            $objectManager=   \Magento\Framework\App\ObjectManager::getInstance();
            $attrSetName = 'Default';
            $attribute_set_factoryCollection = $objectManager->get('\Magento\Eav\Model\ResourceModel\Entity\Attribute\Set\CollectionFactory');
            $attribute_set_collection = $attribute_set_factoryCollection->create();
            $attribute_set_collection
            ->addFieldToFilter('entity_type_id',4)
            ->addFieldToFilter('attribute_set_name',$attrSetName);
            $att_set = current($attribute_set_collection->getData());
            $attribute_set_id = $att_set["attribute_set_id"];
            $factoryCollection = $objectManager->get('\Magento\Catalog\Model\ResourceModel\Product\CollectionFactory');
            $collection = $factoryCollection->create();
            $collection->addFieldToSelect("name");
            $collection->addFieldToFilter('attribute_set_id',$attribute_set_id);
            $FrameName = array();
            foreach ($collection as $item) {
                $FrameName[] =  $item->getName();
            }
            */
            // get frames data static as of now
            $frameArray = array
            (
                array
                (
                    "m_sku" => "M0907",
                    "m_name" => "Frame M0907",
                    "m_status" => "1",
                    "m_frame_type" => "Standard",
                    "m_frame_width" => "4",
                    "m_frame_depth" => "2",
                    "m_frame_rabbet_depth" => "25",
                    "m_max_outer_size" => "999",
                    "m_moulding_waste_pct" => "0.65",
                    "m_landed_cost_per_foot" => "4.554",
                    "m_color_frame" => "Antique Gold",
                    "m_color_family" => "Gold",
                    "m_frame_family" => "Oversized Classics",
                ),

                array
                (
                    "m_sku" => "MC1231SUB1",
                    "m_name" => "Frame MC1231SUB1",
                    "m_status" => "1",
                    "m_frame_type" => "Standard",
                    "m_frame_width" => "3.875",
                    "m_frame_depth" => "1.25",
                    "m_frame_rabbet_depth" => "35",
                    "m_max_outer_size" => "999",
                    "m_moulding_waste_pct" => "0.65",
                    "m_landed_cost_per_foot" => "2.93",
                    "m_color_frame" => "Antique Gold",
                    "m_color_family" => "Gold",
                    "m_frame_family" => "Oversized Classics",
                ),

                array
                (
                    "m_sku" => "MC1229SUB1",
                    "m_name" => "Frame MC1229SUB1",
                    "m_status" => "1",
                    "m_frame_type" => "Standard",
                    "m_frame_width" => "4",
                    "m_frame_depth" => "1.25",
                    "m_frame_rabbet_depth" => "35",
                    "m_max_outer_size" => "999",
                    "m_moulding_waste_pct" => "0.65",
                    "m_landed_cost_per_foot" => "2.97",
                    "m_color_frame" => "Antique Gold",
                    "m_color_family" => "Gold",
                    "m_frame_family" => "Oversized Classics"
                ),

                array
                (
                    "m_sku" => "MC1230SUB1",
                    "m_name" => "Frame MC1230SUB1",
                    "m_status" => "1",
                    "m_frame_type" => "Standard",
                    "m_frame_width" => "3.75",
                    "m_frame_depth" => "1.375",
                    "m_frame_rabbet_depth" => "25",
                    "m_max_outer_size" => "999",
                    "m_moulding_waste_pct" => "0.65",
                    "m_landed_cost_per_foot" => "2.95",
                    "m_color_frame" => "Antique Gold",
                    "m_color_family" => "Gold",
                    "m_frame_family" => "Oversized Classics"
                ),

                array
                (
                    "m_sku" => "MC0943SUB1",
                    "m_name" => "Frame MC0943SUB1",
                    "m_status" => "1",
                    "m_frame_type" => "Standard",
                    "m_frame_width" => "2.75",
                    "m_frame_depth" => "2.125",
                    "m_frame_rabbet_depth" => "45",
                    "m_max_outer_size" => "999",
                    "m_moulding_waste_pct" => "0.65",
                    "m_landed_cost_per_foot" => "2.49",
                    "m_color_frame" => "Antique Gold",
                    "m_color_family" => "Gold",
                    "m_frame_family" => "Oversized Classics"
                ),

                array
                (
                    "m_sku" => "MC0943SUB1test",
                    "m_name" => "Frame MC0943SUB1test",
                    "m_status" => "1",
                    "m_frame_type" => "Standard",
                    "m_frame_width" => "2.75",
                    "m_frame_depth" => "2.125",
                    "m_frame_rabbet_depth" => "55",
                    "m_max_outer_size" => "999",
                    "m_moulding_waste_pct" => "0.65",
                    "m_landed_cost_per_foot" => "2.49",
                    "m_color_frame" => "Antique Gold test1",
                    "m_color_family" => "Gold test1",
                    "m_frame_family" => "Oversized Classics"
                ),

                array
                (
                    "m_sku" => "MC0943SUB1test2",
                    "m_name" => "Frame MC0943SUB1test2",
                    "m_status" => "1",
                    "m_frame_type" => "Standard",
                    "m_frame_width" => "2.75",
                    "m_frame_depth" => "2.125",
                    "m_frame_rabbet_depth" => "55",
                    "m_max_outer_size" => "999",
                    "m_moulding_waste_pct" => "0.65",
                    "m_landed_cost_per_foot" => "2.49",
                    "m_color_frame" => "Antique Gold test2",
                    "m_color_family" => "Gold",
                    "m_frame_family" => "Oversized Classics"
                ),

                array
                (
                    "m_sku" => "MC0943SUB1test3",
                    "m_name" => "Frame MC0943SUB1test3",
                    "m_status" => "1",
                    "m_frame_type" => "Standard",
                    "m_frame_width" => "2.75",
                    "m_frame_depth" => "2.125",
                    "m_frame_rabbet_depth" => "0.75",
                    "m_max_outer_size" => "999",
                    "m_moulding_waste_pct" => "0.65",
                    "m_landed_cost_per_foot" => "2.49",
                    "m_color_frame" => "Antique Gold test3",
                    "m_color_family" => "Gold test3",
                    "m_frame_family" => "Oversized Classics"
                ),
                array
                (
                    "m_sku" => "L0023",
                    "m_name" => "Liner L0023",
                    "m_status" => "1",
                    "m_frame_type" => "Liner",
                    "m_frame_width" => "2",
                    "m_frame_depth" => "1.375",
                    "m_frame_rabbet_depth" => "0.375",
                    "m_max_outer_size" => "10",
                    "m_moulding_waste_pct" => "0.65",
                    "m_landed_cost_per_foot" => "0.99",
                    "m_color_frame" => "White Linen",
                    "m_color_family" => "White",
                    "m_frame_family" => "Linen Liner"
                ),
                array
                (
                    "m_sku" => "M0596",
                    "m_name" => "Liner M0596",
                    "m_status" => "1",
                    "m_frame_type" => "Liner",
                    "m_frame_width" => "1",
                    "m_frame_depth" => "1",
                    "m_frame_rabbet_depth" => "0.25",
                    "m_max_outer_size" => "2",
                    "m_moulding_waste_pct" => "0.65",
                    "m_landed_cost_per_foot" => "0.7245",
                    "m_color_frame" => "White Linen",
                    "m_color_family" => "White",
                    "m_frame_family" => "Linen Liner"
                )

            );
            $finalFrameArr = [];
            foreach ($frameArray as $frame) {
                $finalFrameArr[$frame['m_sku']] = $frame;
            }

            $resultJson = $this->resultFactory->create(ResultFactory::TYPE_JSON);
            $resultJson->setData(['content' => $blockInstance, 'returndata' => $mediafinalArray, 'FrameName' => $finalFrameArr]);
            return $resultJson;
        }
    }

    /**
     * @return \Magento\Framework\App\ResponseInterface|\Magento\Framework\View\Result\Page
     */
    public function execute()
    {

        $productId = $this->getRequest()->getParam('product');
        // $attributes = $this->getRequest()->getParam('optAttributes');
        // $selectedAttributes = $this->getRequest()->getParam('selectedAttributes');

        if ($this->getRequest()->getParam('isAjax')) {

            $product = $this->product->load(2047);
            $resultPage = $this->resultPageFactory->create();
            $blockInstance = $resultPage->getLayout()->getBlock('productimize.home')
                ->setData('product_ids', $productId)
                ->setData('productData', $product)
                ->toHtml();
            /* $url = 'https://wendoveruat-m2.perficientdcsdemo.com/rest/V1/artrules/';
             $curl = curl_init($url);

             curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
             curl_setopt($curl, CURLOPT_HTTPHEADER, [
                 'Content-Type: application/json',
                 'Authorization: Bearer gtas4zsxg9ytr5p2m7kwjfpwhlw59sf4'
             ]);
             $response = curl_exec($curl);
             $httpcode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
             curl_close($curl);

             if ($httpcode == 200) {
                 $decodedData = json_decode($response);
                 $media = $treatment = $mediatreatment = $frametreatment = [];
                 if (isset($decodedData) && !empty($decodedData)) {
                     foreach ($decodedData['0']->items as $data) {
                         if ($data->table == 'media') {
                             $media = $data->data;
                         }
                         if ($data->table == 'treatment') {
                             $treatment = $data->data;
                         }
                         if ($data->table == 'media_treatment') {
                             $mediatreatment = $data->data;
                         }
                         if ($data->table == 'frame_treatment') {
                             $frametreatment = $data->data;
                         }
                     }
                 }
             }
             $mediafinalArray = [];
             $treatmentfinalArray = [];
             $mediatreatmentfinalArray = [];
             $treatframeArray = [];
             foreach ($treatment as $treatmentitem) {
                 $treatmentfinalArray[$treatmentitem->treatment_sku] = (array)$treatmentitem;
             }
             // final frame array
             foreach ($frametreatment as $frametreatmentitem) {
                 $treatframeArray[$frametreatmentitem->treatment_sku][$frametreatmentitem->frame_type] = (array)$frametreatmentitem;
             }
             foreach ($mediatreatment as $mediatreatitem) {
                 $mediatreatmentfinalArray[$mediatreatitem->media_sku] = (array)$mediatreatitem;
                 $mediareltreat[$mediatreatitem->treatment_sku] = $treatmentfinalArray[$mediatreatitem->treatment_sku];
                 $mediareltreat[$mediatreatitem->treatment_sku]['display_to_customer'] = $mediatreatitem->display_to_customer;
                 // need to merge frames here
                 $mediareltreat[$mediatreatitem->treatment_sku]['frames'] = (isset($treatframeArray[$mediatreatitem->treatment_sku])) ? $treatframeArray[$mediatreatitem->treatment_sku] : [];
                 $mediatreatmentfinalArray[$mediatreatitem->media_sku]['treatment'] = $mediareltreat;
             }
             foreach ($media as $mediaitem) {
                 $mediafinalArray[$mediaitem->sku] = (array)$mediaitem;
                 $mediafinalArray[$mediaitem->sku]['treatment'] = (isset($mediatreatmentfinalArray[$mediaitem->sku]['treatment'])) ? $mediatreatmentfinalArray[$mediaitem->sku]['treatment'] : [];
             }*/

            $connection = $this->resourceConnection->getConnection();
            //$query = "SELECT * FROM `media_treatment` as mt INNER join `media` as m on m.sku=mt.media_sku INNER join `treatment` as t on t.treatment_sku=mt.treatment_sku";
            //$query = "SELECT *, m.display_name as media_display_name, t.display_name as treat_display_name, mt.display_to_customer as display_to_customermt FROM `media_treatment` as mt INNER join `media` as m on m.sku=mt.media_sku INNER join `treatment` as t on t.treatment_sku=mt.treatment_sku where mt.display_to_customer=1";
            $query = "SELECT *, m.display_name as media_display_name, t.display_name as treat_display_name, mt.display_to_customer as display_to_customermt FROM `media_treatment` as mt INNER join `media` as m on m.sku=mt.media_sku INNER join `treatment` as t on t.treatment_sku=mt.treatment_sku  JOIN frame_treatment tf on tf.treatment_sku = t.treatment_sku where mt.display_to_customer=1";
            $mediaTreatmentitems = $connection->fetchAll($query);
            //print_r($mediaTreatmentitems);die;
            $mediafinalArrayNew = [];
            if (is_array($mediaTreatmentitems)) {
                if (!empty($mediaTreatmentitems)) {
                    foreach ($mediaTreatmentitems as $mediaTreatmentitem) {
                        if (array_key_exists($mediaTreatmentitem['media_sku'], $mediafinalArrayNew)) {
                            $mediafinalArrayNew[$mediaTreatmentitem['media_sku']]['treatment'][$mediaTreatmentitem['treatment_sku']] = [
                                'treatment_id' => $mediaTreatmentitem['treatment_id'],
                                'treatment_sku' => $mediaTreatmentitem['treatment_sku'],
                                'base_cost_treatment' => $mediaTreatmentitem['base_cost_treatment'],
                                'display_name' => $mediaTreatmentitem['treat_display_name'],
                                'requires_top_mat' => $mediaTreatmentitem['requires_top_mat'],
                                'requires_bottom_mat' => $mediaTreatmentitem['requires_bottom_mat'],
                                'requires_liner' => $mediaTreatmentitem['requires_liner'],
                                'liner_rabbet_depth_check' => $mediaTreatmentitem['liner_rabbet_depth_check'],
                                'min_glass_size_short' => $mediaTreatmentitem['min_glass_size_short'],
                                'min_glass_size_long' => $mediaTreatmentitem['min_glass_size_long'],
                                'max_glass_size_short' => $mediaTreatmentitem['max_glass_size_short'],
                                'max_glass_size_long' => $mediaTreatmentitem['max_glass_size_long'],
                                'min_rabbet_depth' => $mediaTreatmentitem['min_rabbet_depth'],
                                'image_edge_treatment' => $mediaTreatmentitem['image_edge_treatment'],
                                'new_top_mat_size_left' => $mediaTreatmentitem['new_top_mat_size_left'],
                                'new_top_mat_size_top' => $mediaTreatmentitem['new_top_mat_size_top'],
                                'new_top_mat_size_right' => $mediaTreatmentitem['new_top_mat_size_right'],
                                'new_top_mat_size_bottom' => $mediaTreatmentitem['new_top_mat_size_bottom'],
                                'new_bottom_mat_size_left' => $mediaTreatmentitem['new_bottom_mat_size_left'],
                                'new_bottom_mat_size_top' => $mediaTreatmentitem['new_bottom_mat_size_top'],
                                'new_bottom_mat_size_right' => $mediaTreatmentitem['new_bottom_mat_size_right'],
                                'new_bottom_mat_size_bottom' => $mediaTreatmentitem['new_bottom_mat_size_bottom'],
                                'display_to_customer' => $mediaTreatmentitem['display_to_customermt'],
                                'frames' => ['frame_type' => $mediaTreatmentitem['frame_type']]
                            ];
                        } else {
                            $mediafinalArrayNew[$mediaTreatmentitem['media_sku']] = [
                                'media_id' => $mediaTreatmentitem['media_id'],
                                'sku' => $mediaTreatmentitem['sku'],
                                'base_cost_media' => $mediaTreatmentitem['base_cost_media'],
                                'display_name' => $mediaTreatmentitem['media_display_name'],
                                'display_to_customer' => $mediaTreatmentitem['display_to_customermt'],
                                'min_image_size_short' => $mediaTreatmentitem['min_image_size_short'],
                                'min_image_size_long' => $mediaTreatmentitem['min_image_size_long'],
                                'max_image_size_short' => $mediaTreatmentitem['max_image_size_short'],
                                'max_image_size_long' => $mediaTreatmentitem['max_image_size_long'],
                                'treatment' => [
                                    $mediaTreatmentitem['treatment_sku'] => [
                                        'treatment_id' => $mediaTreatmentitem['treatment_id'],
                                        'treatment_sku' => $mediaTreatmentitem['treatment_sku'],
                                        'base_cost_treatment' => $mediaTreatmentitem['base_cost_treatment'],
                                        'display_name' => $mediaTreatmentitem['treat_display_name'],
                                        'requires_top_mat' => $mediaTreatmentitem['requires_top_mat'],
                                        'requires_bottom_mat' => $mediaTreatmentitem['requires_bottom_mat'],
                                        'requires_liner' => $mediaTreatmentitem['requires_liner'],
                                        'liner_rabbet_depth_check' => $mediaTreatmentitem['liner_rabbet_depth_check'],
                                        'min_glass_size_short' => $mediaTreatmentitem['min_glass_size_short'],
                                        'min_glass_size_long' => $mediaTreatmentitem['min_glass_size_long'],
                                        'max_glass_size_short' => $mediaTreatmentitem['max_glass_size_short'],
                                        'max_glass_size_long' => $mediaTreatmentitem['max_glass_size_long'],
                                        'min_rabbet_depth' => $mediaTreatmentitem['min_rabbet_depth'],
                                        'image_edge_treatment' => $mediaTreatmentitem['image_edge_treatment'],
                                        'new_top_mat_size_left' => $mediaTreatmentitem['new_top_mat_size_left'],
                                        'new_top_mat_size_top' => $mediaTreatmentitem['new_top_mat_size_top'],
                                        'new_top_mat_size_right' => $mediaTreatmentitem['new_top_mat_size_right'],
                                        'new_top_mat_size_bottom' => $mediaTreatmentitem['new_top_mat_size_bottom'],
                                        'new_bottom_mat_size_left' => $mediaTreatmentitem['new_bottom_mat_size_left'],
                                        'new_bottom_mat_size_top' => $mediaTreatmentitem['new_bottom_mat_size_top'],
                                        'new_bottom_mat_size_right' => $mediaTreatmentitem['new_bottom_mat_size_right'],
                                        'new_bottom_mat_size_bottom' => $mediaTreatmentitem['new_bottom_mat_size_bottom'],
                                        'display_to_customer' => $mediaTreatmentitem['display_to_customermt'],
                                        'frames' => ['frame_type' => $mediaTreatmentitem['frame_type']]
                                    ]
                                ]
                            ];
                        }
                    }
                }
            }
            unset($mediafinalArray);
            $mediafinalArray = $mediafinalArrayNew;
            //print_r($mediafinalArray);die;

            // formatted data ends
            //$this->productimizeCalculation->gettest();
            //$sizeDetail = $this->productimizeCalculation->getSizeCalculation('papper_matte','deck_top_bot_hf_sbox');
            //$mediafinalArray['size'] = $sizeDetail;


            //need to remove object manager for frame
            /*
            $objectManager=   \Magento\Framework\App\ObjectManager::getInstance();
            $attrSetName = 'Default';
            $attribute_set_factoryCollection = $objectManager->get('\Magento\Eav\Model\ResourceModel\Entity\Attribute\Set\CollectionFactory');
            $attribute_set_collection = $attribute_set_factoryCollection->create();
            $attribute_set_collection
            ->addFieldToFilter('entity_type_id',4)
            ->addFieldToFilter('attribute_set_name',$attrSetName);
            $att_set = current($attribute_set_collection->getData());
            $attribute_set_id = $att_set["attribute_set_id"];
            $factoryCollection = $objectManager->get('\Magento\Catalog\Model\ResourceModel\Product\CollectionFactory');
            $collection = $factoryCollection->create();
            $collection->addFieldToSelect("name");
            $collection->addFieldToFilter('attribute_set_id',$attribute_set_id);
            $FrameName = array();
            foreach ($collection as $item) {
                $FrameName[] =  $item->getName();
            }
            */
            // get frames data static as of now
            $frameArray = array
            (
                array
                (
                    "m_sku" => "M0907",
                    "m_name" => "Frame M0907",
                    "m_status" => "1",
                    "m_frame_type" => "Standard",
                    "m_frame_width" => "4",
                    "m_frame_depth" => "2",
                    "m_frame_rabbet_depth" => "0.75",
                    "m_max_outer_size" => "999",
                    "m_moulding_waste_pct" => "0.65",
                    "m_landed_cost_per_foot" => "4.554",
                    "m_color_frame" => "Antique Gold",
                    "m_color_family" => "Gold",
                    "m_frame_family" => "Oversized Classics",
                ),

                array
                (
                    "m_sku" => "MC1231SUB1",
                    "m_name" => "Frame MC1231SUB1",
                    "m_status" => "1",
                    "m_frame_type" => "Standard",
                    "m_frame_width" => "3.875",
                    "m_frame_depth" => "1.25",
                    "m_frame_rabbet_depth" => "0.75",
                    "m_max_outer_size" => "999",
                    "m_moulding_waste_pct" => "0.65",
                    "m_landed_cost_per_foot" => "2.93",
                    "m_color_frame" => "Antique Gold",
                    "m_color_family" => "Gold",
                    "m_frame_family" => "Oversized Classics",
                ),

                array
                (
                    "m_sku" => "MC1229SUB1",
                    "m_name" => "Frame MC1229SUB1",
                    "m_status" => "1",
                    "m_frame_type" => "Standard",
                    "m_frame_width" => "4",
                    "m_frame_depth" => "1.25",
                    "m_frame_rabbet_depth" => "0.75",
                    "m_max_outer_size" => "999",
                    "m_moulding_waste_pct" => "0.65",
                    "m_landed_cost_per_foot" => "2.97",
                    "m_color_frame" => "Antique Gold",
                    "m_color_family" => "Gold",
                    "m_frame_family" => "Oversized Classics"
                ),

                array
                (
                    "m_sku" => "MC1230SUB1",
                    "m_name" => "Frame MC1230SUB1",
                    "m_status" => "1",
                    "m_frame_type" => "Standard",
                    "m_frame_width" => "3.75",
                    "m_frame_depth" => "1.375",
                    "m_frame_rabbet_depth" => "0.625",
                    "m_max_outer_size" => "999",
                    "m_moulding_waste_pct" => "0.65",
                    "m_landed_cost_per_foot" => "2.95",
                    "m_color_frame" => "Antique Gold",
                    "m_color_family" => "Gold",
                    "m_frame_family" => "Oversized Classics"
                ),

                array
                (
                    "m_sku" => "MC0943SUB1",
                    "m_name" => "Frame MC0943SUB1",
                    "m_status" => "1",
                    "m_frame_type" => "Standard",
                    "m_frame_width" => "2.75",
                    "m_frame_depth" => "2.125",
                    "m_frame_rabbet_depth" => "0.75",
                    "m_max_outer_size" => "999",
                    "m_moulding_waste_pct" => "0.65",
                    "m_landed_cost_per_foot" => "2.49",
                    "m_color_frame" => "Antique Gold",
                    "m_color_family" => "Gold",
                    "m_frame_family" => "Oversized Classics"
                ),

                array
                (
                    "m_sku" => "MC1228SUB1",
                    "m_name" => "Frame MC1228SUB1",
                    "m_status" => "1",
                    "m_frame_type" => "Standard",
                    "m_frame_width" => "3",
                    "m_frame_depth" => "1.875",
                    "m_frame_rabbet_depth" => "0.625",
                    "m_max_outer_size" => "999",
                    "m_moulding_waste_pct" => "0.65",
                    "m_landed_cost_per_foot" => "2.48",
                    "m_color_frame" => "Antique Gold",
                    "m_color_family" => "Gold",
                    "m_frame_family" => "Oversized Classics"
                ),

                array
                (
                    "m_sku" => "MC0899SUB1",
                    "m_name" => "Frame MC0899SUB1",
                    "m_status" => "1",
                    "m_frame_type" => "Standard",
                    "m_frame_width" => "3",
                    "m_frame_depth" => "1.75",
                    "m_frame_rabbet_depth" => "1",
                    "m_max_outer_size" => "999",
                    "m_moulding_waste_pct" => "0.65",
                    "m_landed_cost_per_foot" => "2.44",
                    "m_color_frame" => "Antique Gold",
                    "m_color_family" => "Gold",
                    "m_frame_family" => "Oversized Classics"
                ),

                array
                (
                    "m_sku" => "MC0933SUB1",
                    "m_name" => "Frame MC0933SUB1",
                    "m_status" => "1",
                    "m_frame_type" => "Standard",
                    "m_frame_width" => "3",
                    "m_frame_depth" => "1.125",
                    "m_frame_rabbet_depth" => "0.625",
                    "m_max_outer_size" => "999",
                    "m_moulding_waste_pct" => "0.65",
                    "m_landed_cost_per_foot" => "1.76",
                    "m_color_frame" => "Antique Gold",
                    "m_color_family" => "Gold",
                    "m_frame_family" => "Oversized Classics"
                ),

                array
                (
                    "m_sku" => "M0585",
                    "m_name" => "Frame M0585",
                    "m_status" => "1",
                    "m_frame_type" => "Standard",
                    "m_frame_width" => "4.125",
                    "m_frame_depth" => "1.125",
                    "m_frame_rabbet_depth" => "0.625",
                    "m_max_outer_size" => "999",
                    "m_moulding_waste_pct" => "0.65",
                    "m_landed_cost_per_foot" => "4.044",
                    "m_color_frame" => "Gold Leaf",
                    "m_color_family" => "Gold",
                    "m_frame_family" => "Oversized Classics"
                ),
                array
                (
                    "m_sku" => "MC2796",
                    "m_name" => "Frame MC2796",
                    "m_status" => "1",
                    "m_frame_type" => "Standard",
                    "m_frame_width" => "3",
                    "m_frame_depth" => "1.125",
                    "m_frame_rabbet_depth" => "0.5",
                    "m_max_outer_size" => "999",
                    "m_moulding_waste_pct" => "0.65",
                    "m_landed_cost_per_foot" => "4.044",
                    "m_color_frame" => "Gold Leaf",
                    "m_color_family" => "Gold",
                    "m_frame_family" => "Oversized Classics"
                ),


                array
                (
                    "m_sku" => "L0023",
                    "m_name" => "Liner L0023",
                    "m_status" => "1",
                    "m_frame_type" => "Liner",
                    "m_frame_width" => "2",
                    "m_frame_depth" => "1.375",
                    "m_frame_rabbet_depth" => "0.375",
                    "m_max_outer_size" => "10",
                    "m_moulding_waste_pct" => "0.65",
                    "m_landed_cost_per_foot" => "0.99",
                    "m_color_frame" => "White Linen",
                    "m_color_family" => "White",
                    "m_frame_family" => "Linen Liner"
                ),
                array
                (
                    "m_sku" => "M0596",
                    "m_name" => "Liner M0596",
                    "m_status" => "1",
                    "m_frame_type" => "Liner",
                    "m_frame_width" => "1",
                    "m_frame_depth" => "1",
                    "m_frame_rabbet_depth" => "0.25",
                    "m_max_outer_size" => "2",
                    "m_moulding_waste_pct" => "0.65",
                    "m_landed_cost_per_foot" => "0.7245",
                    "m_color_frame" => "White Linen",
                    "m_color_family" => "White",
                    "m_frame_family" => "Linen Liner"
                )

            );
            $finalFrameArr = [];
            foreach ($frameArray as $frame) {
                $finalFrameArr[$frame['m_sku']] = $frame;
            }

            $resultJson = $this->resultFactory->create(ResultFactory::TYPE_JSON);
            $resultJson->setData(['content' => $blockInstance, 'returndata' => $mediafinalArray, 'FrameName' => $finalFrameArr]);
            return $resultJson;
        }
    }
}
