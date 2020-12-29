<?php

namespace DCKAP\Productimize\Model\Source;

class ProductimizeCloud implements \Magento\Framework\Option\ArrayInterface
{
    public function toOptionArray()
    {
        return [
            [
                'value' => 'staging',
                'label' => __('Staging')
            ],
            [
                'value' => 'production',
                'label' => __('Production')
            ],
        ];
    }

}