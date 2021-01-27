<?php
/**
 * @author     DCKAP <extensions@dckap.com>
 * @package    DCKAP_Productimize
 * @copyright  Copyright (c) 2017 DCKAP Inc (http://www.dckap.com)
 * @license    http://opensource.org/licenses/osl-3.0.php  Open Software License (OSL 3.0)
 */

namespace DCKAP\Productimize\Controller\Index;

use Magento\Framework\App\Action\Action;
use Magento\Framework\App\Action\Context;
use Magento\Framework\View\Result\PageFactory;
use Magento\Framework\Registry;
use Magento\Catalog\Model\Product;
//use DCKAP\Productimize\Helper\Data;



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
     * Index constructor.
     * @param Context $context
     * @param \Magento\Framework\View\Result\PageFactory $resultPageFactory
     * @param \Magento\Framework\Registry $coreRegistry
     * @param \DCKAP\Productimize\Helper\Data $helperData
     */
    public function __construct(Context $context,
                                PageFactory $resultPageFactory,
                                Registry $coreRegistry,
                                Product $product

        ){
        $this->_coreRegistry = $coreRegistry;
        $this->resultPageFactory = $resultPageFactory;
       // $this->helperData = $helperData;
        $this->product = $product;
        $this->resultFactory = $context->getResultFactory();
        parent::__construct($context);
    }

    /**
     * @return \Magento\Framework\App\ResponseInterface|\Magento\Framework\View\Result\Page
     */
    public function execute() {

        $productId =  $this->getRequest()->getParam('product');
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
            $resultJson = $this->resultFactory->create(ResultFactory::TYPE_JSON);
            $resultJson->setData(['content' => $blockInstance]);
            return $resultJson;
        }
    }
}
