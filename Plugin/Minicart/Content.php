<?php
/**
* @author DCKAP <extensions@dckap.com>
* @package DCKAP_Productimize
* @copyright Copyright (c) 2017 DCKAP Inc (http://www.dckap.com)
* @license http://opensource.org/licenses/osl-3.0.php Open Software License (OSL 3.0)
*/

namespace Mahadckap\Productimize\Plugin\Minicart;

/**
* Class Image
* @package Mahadckap\Productimize\Plugin\Minicart
*/
class Content
{
	/**
	* Image constructor.
	* @param \Magento\Framework\App\ResourceConnection $resource
	* @param \Magento\Store\Model\StoreManagerInterface $storeManager
	*/

	protected $storeManager;
	protected $resource;
	public function __construct(\Magento\Framework\App\ResourceConnection $resource, \Magento\Store\Model\StoreManagerInterface $storeManager)
	{
	$this->resource = $resource;
	$this->storeManager = $storeManager;
	}

	/**
	* @param $subject
	* @param $proceed
	* @param $item
	* @return mixed
	*/
	public function aroundGetItemData($subject, $proceed, $item)
	{
		$result = $proceed($item);
		$itemData = $item->getBuyRequest()->getData();


        if ($itemData && count($itemData) > 0) {
            $pzCartProperties = isset($itemData['pz_cart_properties']) ? $itemData['pz_cart_properties'] : '';
            if (isset($pzCartProperties) && !empty($pzCartProperties)) {
                $decodePzCartProperties =  json_decode($pzCartProperties);
                if ($decodePzCartProperties) {
                    if (isset($decodePzCartProperties->{'CustomImage'})) {
						$customizedImageURL = $decodePzCartProperties->{'CustomImage'};
						if ($customizedImageURL) {
							$result['product_image']['src'] = $customizedImageURL;
						}
					}
                }
            }
        }
		return $result;
	}
}
