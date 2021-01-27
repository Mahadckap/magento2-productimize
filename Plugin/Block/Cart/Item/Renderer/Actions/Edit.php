<?php

namespace DCKAP\Productimize\Plugin\Block\Cart\Item\Renderer\Actions;

class Edit
{
    /**
     * @param \Magento\Checkout\Block\Cart\Item\Renderer\Actions\Edit $subject
     * @param $result
     * @return string
     */
    public function afterGetConfigureUrl(
        \Magento\Checkout\Block\Cart\Item\Renderer\Actions\Edit $subject,
        $result
    )
    {
        if ($subject->getItem()->getBuyRequest()->getEditId()) {
            return $subject->getUrl(
                'checkout/cart/configure',
                [
                    'id' => $subject->getItem()->getId(),
                    'product_id' => $subject->getItem()->getProduct()->getId(),
                    'edit_id' => 1
                ]
            );
        } else {
            return $result;
        }
    }
}