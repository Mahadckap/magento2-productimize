<?php

namespace DCKAP\Productimize\Observer;

use Magento\Framework\Event\ObserverInterface;
use Magento\Framework\App\RequestInterface;
use Magento\Framework\Serialize\SerializerInterface;
use Psr\Log\LoggerInterface;

class SetProductimizeOptions implements ObserverInterface
{
    protected $request;
    protected $serializer;
    protected $logger;

    public function __construct(
        RequestInterface $request,
        SerializerInterface $serializer,
        LoggerInterface $logger
    )
    {
        $this->request = $request;
        $this->serializer = $serializer;
        $this->logger = $logger;
    }

    public function execute(\Magento\Framework\Event\Observer $observer)
    {
        if ($this->request->getFullActionName() == 'checkout_cart_add') { //checking when product is adding to cart
            $requestInfo = $observer->getInfo();
            if (isset($requestInfo['promize_cart_items']) && !empty($requestInfo['promize_cart_items'])) {
                $productimizeOptions = [];
                foreach ($this->serializer->unserialize($requestInfo['promize_cart_items']) as $key => $value) {
                    $productimizeOptions[] = [
                        'label' => __(ucfirst($value['tab_name'])),
                        'value' => __(ucfirst($value['option_name'])),
                    ];
                }
                $observer->getProduct()->addCustomOption('additional_options', $this->serializer->serialize($productimizeOptions));
            }
        }
    }
}
