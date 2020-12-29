<?php

namespace Mahadckap\Productimize\Plugin\Block\Cart\Item;

class RendererPlugin
{
    /**
     * Override cart image, if designer product
     *
     * @param \Magento\Checkout\Block\Cart\Item\Renderer $subject
     * @param \Magento\Catalog\Block\Product\Image $result
     * @see \Magento\Checkout\Block\Cart\Item\Renderer::getImage
     */
    public function afterGetImage(\Magento\Checkout\Block\Cart\Item\Renderer $subject, $result)
    {
        $item = $subject->getItem();
        $itemData = $item->getBuyRequest()->getData();

        if ($itemData && count($itemData) > 0) {

            $pzCartProperties = isset($itemData['pz_cart_properties']) ? $itemData['pz_cart_properties'] : '';

            if (isset($pzCartProperties) && !empty($pzCartProperties)) {
                $decodePzCartProperties = json_decode($pzCartProperties);
                // Replace the product image in mini cart with customized image
                if ($decodePzCartProperties) {
                    if(isset($decodePzCartProperties->{' CustomImage'})) {
                        $customizedImageURL = $decodePzCartProperties->{' CustomImage'};
                        if ($customizedImageURL) {
                            $result->setImageUrl($customizedImageURL);
                        }
                    }
                }
            }
        }
        return $result;

    }
}