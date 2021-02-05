<?php

namespace Mahadckap\Productimize\Plugin\Rewrite\Checkout\CustomerData;

class DefaultItem extends \Magento\Checkout\CustomerData\DefaultItem
{
    /**
     * @return string
     */
    protected function getConfigureUrl()
    {
        if ($this->item->getBuyRequest()->getEditId()) {
            return $this->urlBuilder->getUrl(
                'checkout/cart/configure',
                ['id' => $this->item->getId(), 'product_id' => $this->item->getProduct()->getId(), 'edit_id' => 1]
            );
        } else {
            return parent::getConfigureUrl();
        }
    }
}
