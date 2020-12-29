<?php

namespace DCKAP\Productimize\Model\Source;

class ProductimizeSiteUrl implements \Magento\Framework\Option\ArrayInterface
{
    public function toOptionArray()
    {

        $objectManager = \Magento\Framework\App\ObjectManager::getInstance();
        $storeManager = $objectManager->get('\Magento\Store\Model\StoreManagerInterface');
        $siteUrl = $storeManager->getStore()->getBaseUrl(\Magento\Framework\UrlInterface::URL_TYPE_WEB);

        return [
            [
                'value' => $siteUrl,
                'label' => __('Staging')
            ]
        ];
    }

}