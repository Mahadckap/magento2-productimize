<?php
namespace Mahadckap\Productimize\Helper;

use Magento\Framework\App\Helper\Context;
use Magento\Wishlist\Model\ResourceModel\Item\CollectionFactory;
use Magento\Wishlist\Model\Item\OptionFactory;

class Data extends \Magento\Framework\App\Helper\AbstractHelper
{
    /**
     * @var \Magento\Framework\App\Request\Http
     */
    protected $request;
    /**
     * @var \Magento\Checkout\Model\Session
     */
    protected $_checkoutSession;
    /**
     * @var OptionFactory
     */
    protected $optionFactory;

    public function __construct(
        Context $context,
        \Magento\Framework\App\Request\Http $request,
        \Magento\Checkout\Model\Session $_checkoutSession,
        OptionFactory $optionFactory
    )
    {
        parent::__construct($context);
        $this->request = $request;
        $this->_checkoutSession = $_checkoutSession;
        $this->optionFactory = $optionFactory;
    }

    public function getCurrentpagehandle()
    {
        return $this->request->getFullActionName();
    }

    public function checkEditidinurl()
    {
        if($this->_getRequest()->getParam('edit_id'))
            return true;
        else return false;
    }

    public function getParaminrequest()
    {
        if($this->_getRequest()->getParam('id'))
        return $this->_getRequest()->getParam('id');
        else return '';
    }

    public function getAdditionaloptionsbyquoteId($quoteId)
    {
        $items = $this->_checkoutSession->getQuote()->getAllItems();
        $movetoWishlistvalues = [];
        if(!empty($items)){
            foreach ($items as $item) {
                if ($item->getId() == $quoteId) {
                    $additionalOptions = $item->getOptionByCode('additional_options');
                    if ($additionalOptions) {
                        $additionalOptions = json_decode($item->getOptionByCode('additional_options')->getValue());
                        if (!empty($additionalOptions)) {
                            foreach ($additionalOptions as $additionalOption) {
                                $giftParameters[] = [
                                    'label' => $additionalOption->label,
                                    'value' => $additionalOption->value
                                ];
                                $movetoWishlistvalues[strtolower($additionalOption->label)] = $additionalOption->value;
                            }
                        }
                    }
                }
            }
        }
        return $movetoWishlistvalues;
    }

    public function getAdditionaloptionsbywishlistId($id)
    {
        $options = $this->optionFactory->create()->getCollection()->addItemFilter([$id]);
        $options->addFieldToFilter('code', 'additional_options');
        $additionalOptionsarray = $options->getData();
        $additionalOptions = [];
        $movetoWishlistvalues = [];
        foreach ($additionalOptionsarray as $additionOptionsarraydata){
            if(isset($additionOptionsarraydata['value'])){
                $additionalOptions = json_decode($additionOptionsarraydata['value']);
            }
        }
        if (!empty($additionalOptions)) {
            foreach ($additionalOptions as $additionalOption) {
                $giftParameters[] = [
                    'label' => $additionalOption->label,
                    'value' => $additionalOption->value
                ];
                $movetoWishlistvalues[strtolower($additionalOption->label)] = $additionalOption->value;
            }
        }
        return $movetoWishlistvalues;
    }
}