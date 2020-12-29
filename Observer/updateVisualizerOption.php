<?php
/**
 * @author     DCKAP <extensions@dckap.com>
 * @package    DCKAP_Productimize
 * @copyright  Copyright (c) 2017 DCKAP Inc (http://www.dckap.com)
 * @license    http://opensource.org/licenses/osl-3.0.php  Open Software License (OSL 3.0)
 */

namespace DCKAP\Productimize\Observer;

use Magento\Framework\Event\ObserverInterface;

/**
 * Class updateVisualizerOption
 * @package DCKAP\Productimize\Observer
 */
class updateVisualizerOption implements ObserverInterface
{
    /**
     * @var \Magento\Sales\Api\Data\OrderInterface
     */
    protected $_order;
    protected $logger;

    /**
     * @param \Magento\Framework\App\ResourceConnection $resource
     */
    public function __construct(
        \Magento\Framework\App\ResourceConnection $resource,
        \Magento\Sales\Api\Data\OrderInterface $order,
        \Magento\Sales\Model\Order $orderdetail,
        \Psr\Log\LoggerInterface $logger
    )
    {
        $this->resource = $resource;
        $this->_order = $order;
        $this->orderdetail = $orderdetail;
        $this->logger = $logger;
    }

    /**
     * @param \Magento\Framework\Event\Observer $observer
     * @return void
     */
    public function execute(\Magento\Framework\Event\Observer $observer)
    {
        $connectionMock = $this->resource->getConnection();
        $orderID = $observer->getEvent()->getOrderIds();
        $flag = 0;
        if ($orderId = $orderID[0]) {
            $colorder = $this->orderdetail->load($orderID[0]);
            $collectionorder = $colorder->getAllItems();

            // getCloud Url
            // $cloudUrl = $this->getCloudUrl();

            // getOrder details


            $writer = new \Zend\Log\Writer\Stream(BP . '/var/log/test1.log');
            $logger = new \Zend\Log\Logger();
            $logger->addWriter($writer);
           // $logger->info('Your Order');


            $orderInfo = $this->_order->load($orderID[0]);
            foreach ($collectionorder as $key => $orderitem) {
                $product = $orderitem->getProduct();
                $cust_options = $orderitem->getBuyRequest();
                $cust_option = $cust_options->getData();
                if (isset($cust_option) && $product->getData('product_customizer')) {
                   // $this->logger->info($product->getName());
    
                    $productimize_json_resp = $cust_option['productimize_response'];
                    if (!empty($productimize_json_resp)) {
                        $flag = 1;
                        break;
                    }
                }
            }
            if ($flag == 1) {
               // $customized_image_url = isset($cust_option['customfiles']) ? $cust_option['customfiles'] : '';


                $orderDetails = [];

                $orderDetails['domain_id'] = $cust_option['domain_id'];
                $orderDetails['client_order_id'] = $orderInfo->getId();
                $orderDetails['order_reference_id'] = $orderInfo->getIncrementId();
                $orderDetails['order_currency_code'] = $orderInfo->getStoreCurrencyCode();
                $orderDetails['created_date'] = $orderInfo->getCreatedAt();
                $orderDetails['updated_date'] = $orderInfo->getUpdatedAt();
                //getOrder Shipping address details
                $orderShippingAddress = $orderInfo->getShippingAddress();
                $orderDetails['email'] = $orderShippingAddress->getEmail();
                $orderDetails['firstname'] = $orderShippingAddress->getFirstname();
                $orderDetails['lastname'] = $orderShippingAddress->getLastname();
                $orderDetails['company'] = $orderShippingAddress->getCompany();
                $orderDetails['street'] = $orderShippingAddress->getStreet();
                $orderDetails['city'] = $orderShippingAddress->getCity();
                $orderDetails['region'] = $orderShippingAddress->getRegion();
                $orderDetails['postcode'] = $orderShippingAddress->getPostcode();
                $orderDetails['country_id'] = $orderShippingAddress->getCountryId();
                $orderDetails['telephone'] = $orderShippingAddress->getTelephone();
                $orderDetails['shipping_method'] = $orderInfo->getShippingDescription(); //getShipping Method
                $orderImportDetails = json_encode($orderDetails, true);
                // import order to cloud
               // $importOrder = $this->helper->httpPost($cloudUrl . "importOrderToCloud", $orderImportDetails);


                 $url = "https://devcloud.productimize.com/v3/promizenode/importOrderToCloud";
                        $data = $orderImportDetails;                
                        $ch = curl_init(); 
                        curl_setopt($ch,CURLOPT_URL,$url);
                        curl_setopt($ch, CURLOPT_POST, true);
                        curl_setopt($ch, CURLOPT_HTTPHEADER, [
                            "Content-Type: application/json", 
                            "Content-length: ".strlen($data)
                        ]); 
                        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);            
                        curl_setopt($ch, CURLOPT_POSTFIELDS, $data);            
                        curl_setopt($ch,CURLOPT_RETURNTRANSFER,true);     
                        $output=curl_exec($ch);     
                        if($output === false)   {
                            
                        }
                        curl_close($ch);
                        $importOrder = $output;


                        foreach ($collectionorder as $key => $orderitem) {
                            $cust_options = $orderitem->getBuyRequest();
                            $cust_option = $cust_options->getData();


                            //$logger->info('Your Order'.print_r($cust_option,true));
                        if (isset($cust_option) && isset($cust_option['productimize_response'])) {
                            $productimize_json_resp = $cust_option['productimize_response'];
                            // getOrder item details 
                            $orderItemDetails = [];

                            $subtotal = $orderitem->getRowTotal() + $orderitem->getBaseTaxAmount() - $orderitem->getBaseDiscountAmount(); //calculate sub total

                            $orderItemDetails['promize_order_id'] = $importOrder;

                            $orderItemDetails['order_item_id'] = $orderitem->getId();
                            $orderItemDetails['domain_product_id'] = $cust_option['product'] ? $cust_option['product']: 1;//$cust_option['product_id'];
                            $orderItemDetails['client_product_id'] = $cust_option['product'] ? $cust_option['product']: 1; //$cust_option['product_id'];
                            $orderItemDetails['promize_customizer_id'] = $cust_option['customizer_id']? $cust_option['customizer_id']:1; //1673;
                            $orderItemDetails['client_product_name'] = $orderitem->getName();
                            $orderItemDetails['ordered_quantity'] = $orderitem->getQtyToShip();
                            $orderItemDetails['unit_price'] = $orderitem->getBaseOriginalPrice();
                            $orderItemDetails['base_price'] = $orderitem->getBasePrice();
                            $orderItemDetails['tax_price'] = $orderitem->getBaseTaxAmount();
                            $orderItemDetails['discount_price'] = $orderitem->getBaseDiscountAmount();
                            $orderItemDetails['subtotal'] = $subtotal;
                            $orderItemDetails['created_date'] = $orderInfo->getCreatedAt();
                            $orderItemDetails['base_customized_images'] = ''; //$customized_image_url;
                            // $orderItemDetails['custom_uploaded_images'] = (isset($_collection['customized_image_url']) ? $_collection['customized_image_url'] : "");
                            $orderItemDetails['custom_text'] = "";
                            $orderItemDetails['custom_value'] = isset($productimize_json_resp) ? $productimize_json_resp : '';
                            $orderImportItemDetails = json_encode($orderItemDetails, true);
                            try {
                             // import order item to cloud
                             // $importOrderItem = $this->helper->httpPost($cloudUrl . "importOrderItemDetailsToCloud", $orderImportItemDetails);

                               $url = "https://devcloud.productimize.com/v3/promizenode/importOrderItemDetailsToCloud";
                                $data = $orderImportItemDetails;                
                                $ch = curl_init(); 
                                curl_setopt($ch,CURLOPT_URL,$url);
                                curl_setopt($ch, CURLOPT_POST, true);
                                curl_setopt($ch, CURLOPT_HTTPHEADER, [
                                    "Content-Type: application/json", 
                                    "Content-length: ".strlen($data)
                                ]); 
                                curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);            
                                curl_setopt($ch, CURLOPT_POSTFIELDS, $data);            
                                curl_setopt($ch,CURLOPT_RETURNTRANSFER,true);     
                                $output=curl_exec($ch);     
                                if($output === false)   {
                                    $logger->info('ITEMS testtestse');
                                }
                                curl_close($ch);
                            }
                            catch (\Magento\Framework\Exception\LocalizedException $e) {
                            }
                        }
                        //}
                    //}

                }
            }

        }

    }
}
