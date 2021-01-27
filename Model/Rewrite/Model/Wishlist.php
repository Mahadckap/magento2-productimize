<?php

namespace Mahadckap\Productimize\Model\Rewrite\Model;

use Magento\Catalog\Api\ProductRepositoryInterface;
use Magento\Catalog\Model\Product;
use Magento\Catalog\Model\ProductFactory;
use Magento\CatalogInventory\Api\StockRegistryInterface;
use Magento\Framework\App\Config\ScopeConfigInterface;
use Magento\Framework\Math\Random;
use Magento\Framework\Model\Context;
use Magento\Framework\Registry;
use Magento\Framework\Serialize\Serializer\Json;
use Magento\Framework\Stdlib\DateTime;
use Magento\Store\Model\StoreManagerInterface;
use Magento\Wishlist\Helper\Data;
use Magento\Wishlist\Model\ItemFactory;
use Magento\Wishlist\Model\ResourceModel\Item\CollectionFactory;
use Magento\Wishlist\Model\ResourceModel\Wishlist as ResourceWishlist;
use Magento\Wishlist\Model\ResourceModel\Wishlist\Collection;


class Wishlist extends \Magento\Wishlist\Model\Wishlist
{

    /**
     * @var \Magento\Framework\App\RequestInterface
     */
    protected $request;
    /**
     * @var \Magento\Checkout\Model\Session
     */
    protected $_checkoutSession;

    public function __construct(
        Context $context,
        Registry $registry,
        \Magento\Catalog\Helper\Product $catalogProduct,
        Data $wishlistData,
        ResourceWishlist $resource,
        Collection $resourceCollection,
        StoreManagerInterface $storeManager,
        DateTime\DateTime $date,
        ItemFactory $wishlistItemFactory,
        CollectionFactory $wishlistCollectionFactory,
        ProductFactory $productFactory,
        Random $mathRandom,
        DateTime $dateTime,
        ProductRepositoryInterface $productRepository,
        $useCurrentWebsite = true,
        array $data = [],
        Json $serializer = null,
        StockRegistryInterface $stockRegistry = null,
        ScopeConfigInterface $scopeConfig = null,
        \Magento\Framework\App\RequestInterface $request,
        \Magento\Checkout\Model\Session $_checkoutSession
    )
    {
        parent::__construct($context, $registry, $catalogProduct, $wishlistData, $resource, $resourceCollection, $storeManager, $date, $wishlistItemFactory, $wishlistCollectionFactory, $productFactory, $mathRandom, $dateTime, $productRepository, $useCurrentWebsite, $data, $serializer, $stockRegistry, $scopeConfig);
        $this->request = $request;
        $this->_checkoutSession = $_checkoutSession;
    }

    protected function _addCatalogProduct(Product $product, $qty = 1, $forciblySetQty = false)
    {
        $params = $this->request->getParams();
        $movetoWishlistvalues = [];
        $selectedCustomizedoptions = [];
        if (isset($params['pz_cart_properties'])) {
            if ($params['pz_cart_properties'] != '') {
                $addedParams = json_decode($params['pz_cart_properties'], true);
                if (is_array($addedParams)) {
                    if (!empty($addedParams)) {
                        foreach ($addedParams as $addedParamlabel => $addedParamValue) {
                            $selectedCustomizedoptions[] = [
                                'label' => $addedParamlabel,
                                'value' => $addedParamValue
                            ];
                        }
                    }
                }
            }
        }

        if (isset($params['item'])) {
            $itemId = $params['item'];
            $items = $this->_checkoutSession->getQuote()->getAllItems();
            foreach ($items as $item) {
                if ($item->getId() == $itemId) {
                    $additionalOptions = $item->getOptionByCode('additional_options');
                    if ($additionalOptions) {
                        $additionalOptions = json_decode($item->getOptionByCode('additional_options')->getValue(), true);
                        if (!empty($additionalOptions)) {
                            foreach ($additionalOptions as $addedParamlabel => $addedParamValue) {
                                $selectedCustomizedoptions[] = [
                                    'label' => $addedParamValue['label'],
                                    'value' => $addedParamValue['value']
                                ];
                                $movetoWishlistvalues[$addedParamValue['label']] = $addedParamValue['value'];
                            }
                        }
                    }
                }
            }
            if (!empty($selectedCustomizedoptions))
                $movetoWishlistvalues['edit_id'] = 1;
        }

        $product->addCustomOption('additional_options', json_encode($selectedCustomizedoptions));

        $item = null;
        foreach ($this->getItemCollection() as $_item) {
            if ($_item->representProduct($product)) {
                $item = $_item;
                break;
            }
        }

        if ($item === null) {
            $storeId = $product->hasWishlistStoreId() ? $product->getWishlistStoreId() : $this->getStore()->getId();
            $item = $this->_wishlistItemFactory->create();
            $item->setProductId($product->getId());
            $item->setWishlistId($this->getId());
            $item->setAddedAt((new \DateTime())->format(DateTime::DATETIME_PHP_FORMAT));
            $item->setStoreId($storeId);
            $item->setOptions($product->getCustomOptions());
            $item->setProduct($product);
            $item->setQty($qty);
            $item->save();
            if ($item->getId()) {
                $this->getItemCollection()->addItem($item);
            }
        } else {
            $qty = $forciblySetQty ? $qty : $item->getQty() + $qty;
            $item->setQty($qty)->save();
        }
        if (!empty($movetoWishlistvalues)) {
            $item->mergeBuyRequest($movetoWishlistvalues);
        }

        $this->addItem($item);


        return $item;
    }
}