<?php

namespace Mahadckap\Productimize\Plugin\Wishlist\Block;

class AbstractBlock
{
    /**
     * @param \Magento\Wishlist\Block\AbstractBlock $subject
     * @param $result
     * @param $item
     * @param array $additional
     * @return string
     */
    public function afterGetProductUrl(
        \Magento\Wishlist\Block\AbstractBlock $subject,
        $result,
        $item,
        $additional = []
    )
    {
        $subject->getItemConfigureUrl($item);
        return $subject->getItemConfigureUrl($item);
    }
}