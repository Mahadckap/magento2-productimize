<?php

namespace Mahadckap\Productimize\Plugin\CheckoutCart;

class Image

{

    public function afterGetImage(\Magento\Checkout\Block\Cart\Item\Renderer $subject, $result)

    {
    $item = $subject->getItem();
    $options = $item->getProductOptions();
    $imageUrl = 0;
        $writer = new \Zend\Log\Writer\Stream(BP . '/var/log/options.log');
        $logger = new \Zend\Log\Logger();
        $logger->addWriter($options);
    
    foreach ($options as $option) {
    	if($option['label'] == 'designedImage'){
    		$imageUrl = $option['value'];
    	}
    }
    if($imageUrl) {
     	$result->setImageUrl($imageUrl);
    }

    return $result;

    }

}