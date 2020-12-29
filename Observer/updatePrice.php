<?php
/**
 * @author     DCKAP <extensions@dckap.com>
 * @package    DCKAP_Productimize
 * @copyright  Copyright (c) 2017 DCKAP Inc (http://www.dckap.com)
 * @license    http://opensource.org/licenses/osl-3.0.php  Open Software License (OSL 3.0)
 */

namespace Mahadckap\Productimize\Observer;
use Magento\Framework\Event\ObserverInterface;

/**
 * Class updatePrice
 * @package Mahadckap\Productimize\Observer
 */
class updatePrice implements ObserverInterface
{
    /**
     * @param \Magento\Framework\Event\Observer $observer
     * @return void
     */
    public function __construct( \Magento\Framework\App\Request\Http $requestHttp) {
        $this->requestHttp = $requestHttp;
    }

    /**
     * @param \Magento\Framework\Event\Observer $observer
     */
    public function execute(\Magento\Framework\Event\Observer $observer)
    {
        $event = $observer->getEvent();
        $item = $event->getQuoteItem();
        $post = $this->requestHttp->getParams();
        $custom_pricing = '';

        $itemData = $item->getBuyRequest()->getData();


        $writer = new \Zend\Log\Writer\Stream(BP . '/var/log/summary.log');
        $logger = new \Zend\Log\Logger();
        $logger->addWriter($writer);



        if ($itemData && count($itemData) > 0) {
            $pzCartProperties = isset($itemData['pz_objects']) ? $itemData['pz_objects'] : '';
            if (isset($pzCartProperties) && !empty($pzCartProperties)) {
                $new_price = 0;
                $decodePzCartProperties =  json_decode($pzCartProperties);

                $logger->info(print_r($decodePzCartProperties , 1));

                foreach ($decodePzCartProperties as $firstKey):
                    foreach ($firstKey as $value):

                    $logger->info(print_r($value , 1));

                    $price = (isset($value->option_price) && !empty($value->option_price)) ? $value->option_price : 0;
                    $new_price += ($price);
                endforeach;
                endforeach;

                $new_price += $item->getProduct()->getFinalPrice();
                $item->setOriginalCustomPrice($new_price);
                $item->getProduct()->setIsSuperMode(true);
            }
        }
    }
}
