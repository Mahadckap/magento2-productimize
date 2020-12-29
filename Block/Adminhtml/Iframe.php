<?php

namespace Mahadckap\Productimize\Block\Adminhtml;

use Magento\Framework\View\Element\Template;
use Magento\Framework\App\Config\ScopeConfigInterface;

class Iframe extends \Magento\Framework\View\Element\Template
{
    protected $scopeConfig;
    protected $authSession;

    public function __construct(Template\Context $context, ScopeConfigInterface $scopeConfig, array $data = [])
    {
        $this->scopeConfig = $scopeConfig;
        parent::__construct($context, $data);
    }

    public function getConfigValue($key)
    {
        return $this->scopeConfig->getValue('productimize/general/' . $key, \Magento\Store\Model\ScopeInterface::SCOPE_STORE);
    }

    public function getIframeUrl()
    {
        /*
         *return 'http://localhost:3000/loadmagento/
         * ?access_token=uh58bovdhpxplnk2u76hqu3ez30gpyvs
         * &domain_name=127.0.0.1/magento/magento234
         * &license_key=04c75e4ca3787ffa7883c429a2229aaaab54d94c
         * &user_details=' . $this->getEncryptedUserDetails();
         *
         *
         */
        $objectManager = \Magento\Framework\App\ObjectManager::getInstance();
        $storeManager = $objectManager->get('\Magento\Store\Model\StoreManagerInterface');
        $siteUrl = $storeManager->getStore()->getBaseUrl(\Magento\Framework\UrlInterface::URL_TYPE_WEB);
        $siteUrl = preg_replace('#^https?://#', '', $siteUrl);
        $siteUrl = preg_replace('/^www\./', '', $siteUrl);
        $siteUrl = rtrim($siteUrl, '/');

        $domainName = $siteUrl;
        //$adminToken = $this->getAdminToken($domainName);
        $adminToken = $this->getConfigValue('productimize_integration_magento_api_token');



        if ($this->getConfigValue('productmize_cloud') == 'production') {
            return 'https://live.productimize.com/dashboard/loadMagento?domain_name=' . $domainName . '&store_hash='. $domainName . '&access_token='.$adminToken.'&config='.$this->getConfigValue('productmize_cloud');
        } else {
            return 'https://devcloud.productimize.com/admin/loadMagento?domain_name=' . $domainName . '&store_hash='. $domainName . '&access_token='.$adminToken.'&config='.$this->getConfigValue('productmize_cloud');
        }
    }

    //Used AES encryption method- https://stackoverflow.com/questions/19934422/encrypt-string-in-php-and-decrypt-in-node-js
     private function getEncryptedUserDetails()
     {
         $this->username = 'dckap';
         $this->password = 'Mage123!@#';
         $userDetails = json_encode($this);
         $encryptionMethod = "AES-256-CBC";

         $secretKey = "mrjvh2ZyfsWTCD30U5CqhZXIaB4vORAM";  //must be 32 char length
         $iv = substr($secretKey, 0, 16);

         return openssl_encrypt($userDetails, $encryptionMethod, $secretKey, 0, $iv);
     }

    private function getAdminToken($siteUrl){
        $adminUrl = $siteUrl.'/rest/V1/integration/admin/token';
        $ch = curl_init();
        $data = array("username" => "admin", "password" => "admin@123");
        $dataString = json_encode($data);
        $ch = curl_init($adminUrl);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
        curl_setopt($ch, CURLOPT_POSTFIELDS, $dataString);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, array(
            'Content-Type: application/json',
            'Content-Length: ' . strlen($dataString))
        );
        $token = curl_exec($ch);
        $token = json_decode($token);
        return $token;
    }
}
