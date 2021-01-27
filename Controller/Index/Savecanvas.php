<?php
/**
 * @author     DCKAP <extensions@dckap.com>
 * @package    DCKAP_Productimize
 * @copyright  Copyright (c) 2017 DCKAP Inc (http://www.dckap.com)
 * @license    http://opensource.org/licenses/osl-3.0.php  Open Software License (OSL 3.0)
 */

namespace Mahadckap\Productimize\Controller\Index;

use Magento\Framework\App\Action\Action;
use Magento\Framework\App\Action\Context;
use Magento\Framework\View\Result\PageFactory;
use Magento\Store\Model\StoreManagerInterface;

/**
 * Class Savecanvas
 * @package DCKAP\Productimize\Controller\Index
 */
class Savecanvas extends Action
{

    /**
     * @var \Magento\Framework\View\Result\PageFactory
     */
    protected $_storeManager;
    protected $resultPageFactory;

    /**
     * Savecanvas constructor.
     * @param Context $context
     * @param ProductcustomizerFactory $modelProductcustomizerFactory
     * @param \Magento\Framework\View\Result\PageFactory $resultPageFactory
     */
    public function __construct(
        Context $context,
        PageFactory $resultPageFactory,
        StoreManagerInterface $storeManager
    )
    {
        $this->_storeManager = $storeManager;
        $this->resultPageFactory = $resultPageFactory;
        parent::__construct($context);
    }

    /**
     * @return array
     */
    public function execute()
    {
        $base_path = BP;
        $mediaFolderPath = '/productimize/savedcanvas/';
        $randomFolder = $this->_storeManager->getStore()->getBaseMediaDir() . $mediaFolderPath;
        $upload_dir = $randomFolder;

        if (!file_exists($upload_dir)) {
            mkdir($upload_dir, 0777, true);
        }
        $randFolder = $this->_storeManager->getStore()->getBaseUrl(\Magento\Framework\UrlInterface::URL_TYPE_MEDIA);

        $randomFolder = $this->_storeManager->getStore()->getBaseMediaDir() . $mediaFolderPath;
        //$base_path . '/' . $mediaFolderPath;
        if (!file_exists($randomFolder)) {
            mkdir($randomFolder, 0777, true);
        }
        $img = $this->getRequest()->getParam('dataUrl');

        $filetoadd = [];
        $file1 = '';
        //foreach ($imgimgvalue as $imgkey => $img) {
        $filename = 'canvas_image_' . rand();
        if (strpos($img, "data:image/png") !== false) {
            $img = str_replace('data:image/png;base64,', '', $img);
        } else {
            $img = str_replace('data:image/jpeg;base64,', '', $img);
        }
        $img = str_replace(' ', '+', $img);
        $data = base64_decode($img);
        if (strpos($img, "data:image/png") !== false) {
            $file = $randomFolder . $filename . ".png";
            $file1 = $filename . ".png";
        } else {
            // $file = $randomFolder.$filename.".jpg";
            // $file1 = $randFolder.'/'.$filename.".jpg";
            $file = $randomFolder . $filename . ".jpeg";
            $file1 = $filename . ".jpeg";
        }
        $success = file_put_contents($file, $data);
        $filetoadd[] = $randFolder . 'productimize/savedcanvas/' . $file1;
        //}
        $filetoadd1 = implode(',', $filetoadd);
        print_r($filetoadd1);
    }
}
