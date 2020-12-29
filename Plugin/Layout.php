<?php

namespace DCKAP\Productimize\Plugin;

use Magento\Framework\View\Result\Page;
use Magento\Framework\Registry;

class Layout
{
    protected $registry;

    public function __construct(
        Registry $registry
    )
    {
        $this->registry = $registry;
    }

    public function afterAddPageLayoutHandles(Page $subject)
    {
        $product = $this->registry->registry('product');
        if (!$product) {
            return $this;
        }
        //if (!empty($layoutType = $product->getData("product_customizer")) && ($product->getData("product_level") && $product->getData("product_level") !=4 )) {
		if (!empty($layoutType = $product->getData("product_customizer"))) {
            if ($layoutType == 1) {
                $subject->addHandle('catalog_product_view_productimize_custom_button');
                return $subject;
            } else {
                $subject->addHandle('catalog_product_view');
                return $subject;
            }
        }
        return;
    }
}
