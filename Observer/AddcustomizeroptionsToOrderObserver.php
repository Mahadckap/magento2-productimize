<?php

namespace Mahadckap\Productimize\Observer;

use Magento\Framework\Event\Observer;
use Magento\Framework\Event\ObserverInterface;
use Magento\Framework\Serialize\SerializerInterface;

class AddcustomizeroptionsToOrderObserver implements ObserverInterface
{

    /**
     * @var SerializerInterface
     */
    protected $serializer;

    /**
     * AddgiftOptionToOrderObserver constructor.
     * @param SerializerInterface $serializer
     */
    public function __construct(
        SerializerInterface $serializer
    )
    {
        $this->serializer = $serializer;
    }

    /**
     * @param Observer $observer
     * @return $this|void
     */
    public function execute(Observer $observer)
    {
        $quote = $observer->getQuote();
        $order = $observer->getOrder();
        foreach ($quote->getAllVisibleItems() as $quoteItem) {
            $quoteItems[$quoteItem->getId()] = $quoteItem;
        }
        $quoteItemids = array_keys($quoteItems);
        foreach ($order->getAllVisibleItems() as $orderItem) {
            $quoteItemId = $orderItem->getQuoteItemId();
            if (in_array($quoteItemId, $quoteItemids)) {
                $quoteItem = $quoteItems[$quoteItemId];
                $additionalOptions = [];
                if ($quoteItem->getOptionByCode('additional_options')) {
                    $additionalOptions = $this->serializer->unserialize($quoteItem->getOptionByCode('additional_options')->getValue());
                }
                if (count($additionalOptions) > 0) {
                    $options = $orderItem->getProductOptions();
                    $options['additional_options'] = $additionalOptions;
                    $orderItem->setProductOptions($options);
                }
            }
        }
        return $this;
    }
}
