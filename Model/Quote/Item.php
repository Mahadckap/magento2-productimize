<?php
/**
 * @author     DCKAP <extensions@dckap.com>
 * @package    DCKAP_Productimize
 * @copyright  Copyright (c) 2017 DCKAP Inc (http://www.dckap.com)
 * @license    http://opensource.org/licenses/osl-3.0.php  Open Software License (OSL 3.0)
 */

namespace DCKAP\Productimize\Model\Quote;
use Magento\Framework\Api\AttributeValueFactory;
use Magento\Quote\Api\Data\CartItemInterface;
use Magento\Framework\Api\ExtensionAttributesFactory;

/**
 * Class Item
 * @package DCKAP\Productimize\Model\Quote
 */
class Item extends \Magento\Quote\Model\Quote\Item
{
    /**
     * @param \Magento\Catalog\Model\Product $product
     * @return bool
     */
    public function representProduct($product)
    {
        $itemProduct = $this->getProduct();
        if (!$product || $itemProduct->getId() != $product->getId()) {
            return false;
        }
        $stickWithinParent = $product->getStickWithinParent();
        if(!empty($product->getProductCustomizer()))    {
            if($product->getProductCustomizer() == 1)  {
                return false;
            }
        }
        
        if ($stickWithinParent) {
            if ($this->getParentItem() !== $stickWithinParent) {
                return false;
            }
        }
        $productOptions = $product->getCustomOptions();
        $itemOptions = $this->getOptionsByCode();        
        if (!$this->compareOptions($productOptions, $itemOptions)) {
            return false;
        }
        if (!$this->compareOptions($itemOptions, $productOptions)) {
            return false;
        }        
        return true;
        
    }
}
