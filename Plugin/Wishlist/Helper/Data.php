<?php

namespace DCKAP\Productimize\Plugin\Wishlist\Helper;

use Magento\Framework\UrlInterface;

class Data
{

    /**
     * @var UrlInterface
     */
    private $_urlBuilder;

    /**
     * Data constructor.
     * @param UrlInterface $urlBuilder
     */
    public function __construct(
        UrlInterface $urlBuilder
    )
    {
        $this->_urlBuilder = $urlBuilder;
    }

    /**
     * @param \Magento\Wishlist\Helper\Data $subject
     * @param $result
     * @param $item
     * @return string
     */
    public function afterGetConfigureUrl(
        \Magento\Wishlist\Helper\Data $subject,
        $result,
        $item
    )
    {
        if ($item->getBuyRequest()->getEditId()) {
            return $this->_getUrl(
                'wishlist/index/configure',
                [
                    'id' => $item->getWishlistItemId(),
                    'product_id' => $item->getProductId(),
                    'edit_id' => 1
                ]
            );
        } else {
            return $result;
        }
    }

    /**
     * Retrieve url
     *
     * @param   string $route
     * @param   array $params
     * @return  string
     */
    public function _getUrl($route, $params = [])
    {
        return $this->_urlBuilder->getUrl($route, $params);
    }
}