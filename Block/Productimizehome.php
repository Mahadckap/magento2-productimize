<?php
/**
 * @author     DCKAP <extensions@dckap.com>
 * @package    DCKAP_Productimize
 * @copyright  Copyright (c) 2017 DCKAP Inc (http://www.dckap.com)
 * @license    http://opensource.org/licenses/osl-3.0.php  Open Software License (OSL 3.0)
 */

namespace Mahadckap\Productimize\Block;


/**
 * Class Productcustomizer
 * @package Mahadckap\Productimize\Block
 */
class Productimizehome extends \Magento\Framework\View\Element\Template implements \Magento\Framework\DataObject\IdentityInterface
{
    /**
     * Productimize cache tag
     */
    const CACHE_TAG = 'productimize_item';
    /**
     * @var
     */
    protected $_storeManager;
    /**
     * @var \Magento\Framework\Registry
     */
    protected $_coreRegistry = null;

    protected $helperData;

    /**
     * Productcustomizer constructor.
     * @param \Magento\Framework\View\Element\Template\Context $context
     * @param \Magento\Framework\Registry $coreRegistry
     * @param \Mahadckap\Productimize\Model\ResourceModel\Productcustomizer\CollectionFactory $productcustomizerCollectionFactory
     * @param \Mahadckap\Productimize\Model\Productcustomizer $productcustomizerFactory
     * @param \Magento\Catalog\Model\ProductFactory $_productloader
     * @param \Magento\Store\Model\StoreManagerInterface $storeManager
     * @param array $data
     */
    public function __construct(
        \Magento\Framework\View\Element\Template\Context $context,
        \Magento\Framework\Registry $coreRegistry,

        \Magento\Catalog\Model\ProductFactory $_productloader,
        array $data = [])
    {
        parent::__construct($context, $data);
        $this->_coreRegistry = $coreRegistry;
        $this->_productloader = $_productloader;
        //$this->_productcustomizerCollectionFactory = $productcustomizerCollectionFactory;
        //$this->_productcustomizerFactory = $productcustomizerFactory;
        $this->storeManager = $context->getStoreManager();
        //$this->helperData = $helperData;
    }

    /**
     * @return mixed
     */
    public function getStoreBaseUrl()
    {
        return $this->storeManager->getStore()->getBaseUrl(\Magento\Framework\UrlInterface::URL_TYPE_WEB);
    }

    /**
     * @return mixed
     */
    public function getProductimizeDetail()
    {
        return $this->_coreRegistry->registry('product_detail');
    }

    /**
     * @return mixed
     */
    public function getAttributeDetail()
    {
        return $this->_coreRegistry->registry('attribute_detail');
    }

    /**
     * @return mixed
     */
    public function getGlobalSettingDetail()
    {
        return $this->_coreRegistry->registry('global_text_detail');
    }

    /**
     * @param $productid
     * @return $this|string
     */
    public function getProductDetails($productid)
    {
        $ggg = $this->_productcustomizerFactory->getProductDetails($productid);
        return $ggg;
    }

    /**
     * @return array
     */
    public function getIdentities()
    {
        return [self::CACHE_TAG . '_' . 'list'];
    }

    /**
     * @return $this
     */
    public function _prepareLayout()
    {
//        $product_id =  $this->getRequest()->getParam('product');
//        $productname = self::getProductDetails($product_id);
//        $this->pageConfig->getTitle()->set(__($productname->getName().' - Productimize demo'));

        return parent::_prepareLayout();
    }

    /**
     * @param $id
     * @return mixed
     */
    public function getLoadProduct($id)
    {
        return $this->_productloader->create()->load($id);
    }
    public function getCurrentProduct()
    {
        return $this->_coreRegistry->registry('current_product');
    }

    public function getEditProductQryString()
    {
        $editQryString = $this->getRequest()->getParams();
        //if (count)
        return $editQryString;

    }

    public function getProductCustomizationAjaxUrl()
    {
        return $this->getUrl() . 'productimize/index/index';
    }
    public function getMediaUrl()
    {
        $mediaUrl = $this->storeManager->getStore()
            ->getBaseUrl(\Magento\Framework\UrlInterface::URL_TYPE_MEDIA);
        return $mediaUrl;
    }
}