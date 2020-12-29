<?php

namespace DCKAP\Productimize\Controller\Download;

use Magento\Framework\App\Action\Action;
use Magento\Framework\App\Action\Context;
use Magento\Framework\View\Result\PageFactory;
//use Prince\Productattach\Model\ResourceModel\Productattach\CollectionFactory;
use Magento\Framework\App\Request\Http;
//use Prince\Productattach\Helper\Data as PrinceHelper;
use Magento\Framework\App\Response\Http\FileFactory;
use Magento\Framework\App\Filesystem\DirectoryList;
use Magento\Framework\Filesystem\Io\File as MakeDirectory;
use Magento\Framework\Filesystem;
use ZipArchive;
use Magento\Framework\UrlInterface;

class Pdf extends Action
{
    protected $resultPageFactory;
    private $productattachCollectionFactory;
    protected $httpRequest;
    protected $princeHelper;
    protected $fileFactory;
    protected $directoryList;
    protected $makeDirectory;
    protected $filesystem;
    protected $zipArchive;
    protected $urlInterface;

    /*public function __construct(
        Context $context,
        PageFactory $resultPageFactory,
        CollectionFactory $productattachCollectionFactory,
        Http $httpRequest,
        PrinceHelper $princeHelper,
        FileFactory $fileFactory,
        DirectoryList $directoryList,
        MakeDirectory $makeDirectory,
        Filesystem $filesystem,
        ZipArchive $zipArchive,
        UrlInterface $urlInterface
    )*/

    public function __construct(
        Context $context,
        PageFactory $resultPageFactory,
        Http $httpRequest,
        FileFactory $fileFactory,
        DirectoryList $directoryList,
        MakeDirectory $makeDirectory,
        Filesystem $filesystem,
        ZipArchive $zipArchive,
        UrlInterface $urlInterface
    )
    {
        $this->resultPageFactory = $resultPageFactory;
        $this->httpRequest = $httpRequest;
        $this->fileFactory = $fileFactory;
        $this->directoryList = $directoryList;
        $this->makeDirectory = $makeDirectory;
        $this->filesystem = $filesystem;
        $this->zipArchive = $zipArchive;
        $this->urlInterface = $urlInterface;

        parent::__construct($context);
    }

    public function execute()
    {
        $resultPage = $this->resultPageFactory->create();
        $params = $this->httpRequest->getParams();
        $mediaPath = $this->directoryList->getPath('media');
        $pdfPath = $mediaPath . "/productattach_temp/" . time();

       /* if (!is_dir($pdfPath) && !empty($params) && !empty($this->getAttachment($params)->getData())) {
            $this->makeDirectory->mkdir($pdfPath, 0777);
            $attachments = $this->getAttachment($params)->getData();
            foreach ($attachments as $attachment) {
                $attachmentFile = explode('/', $attachment['file']);
                $optimizedAttachment = empty($attachmentFile[0]) ? $attachment['file'] : '/' . $attachment['file'];
                $fileSource = $this->directoryList->getPath("media") . "/productattach" . $optimizedAttachment;
                $fileDestination = $pdfPath . '/' . end($attachmentFile);
                if (file_exists($fileSource)) {
                    $this->filesystem->getDirectoryWrite(DirectoryList::MEDIA)->copyFile(
                        $fileSource,
                        $fileDestination
                    );
                }
            }
            $this->filesystem->getDirectoryWrite(DirectoryList::MEDIA)->writeFile(
                $pdfPath . '/' . 'readme.txt',
                $this->urlInterface->getCurrentUrl()
            );
            try {
                $this->downloadAttachments($pdfPath, $params);
            } catch (\Exception $e) {

            }
        }*/
        return $resultPage;
    }

    private function getCollection()
    {
        //return $this->productattachCollectionFactory->create();
    }

    public function getAttachment($params)
    {
       /* $collection = $this->getCollection();

        $collection->addFieldToFilter(
            'active',
            [
                ['eq' => 1],
                ['finset' => $this->princeHelper->getStoreId()]
            ]
        );

        $collection->addFieldToFilter(
            'file',
            [
                ['neq' => ''],
                ['finset' => $this->princeHelper->getStoreId()]
            ]
        );

        $collection->addFieldToFilter(
            'products',
            [
                ['regexp' => '[[:<:]]' . $params['product_id'] . '[[:>:]]']
            ]
        );

        $collection->addFieldToFilter(
            'name',
            [
                ['eq' => $params['name']],
                ['finset' => $this->princeHelper->getStoreId()]
            ]
        );

        return $collection;*/
    }

    public function downloadAttachments($rootPath, $params)
    {
        /*$dir = $this->directoryList->getPath(\Magento\Framework\App\Filesystem\DirectoryList::MEDIA);

        chdir($rootPath);
        $this->zipArchive->open($params['name'] . '_' . time() . '.zip', \ZipArchive::CREATE | \ZipArchive::OVERWRITE);
        $files = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($rootPath),
            \RecursiveIteratorIterator::LEAVES_ONLY
        );
        foreach ($files as $name => $file) {
            // Skip directories (they would be added automatically)
            if (!$file->isDir()) {
                // Get real and relative path for current file
                $filePath = $file->getRealPath();
                $relativePath = substr($filePath, strlen($rootPath) + 1);

                // Add current file to archive
                $this->zipArchive->addFile($filePath, $relativePath);
            }
        }
        $this->zipArchive->close();

        $this->fileFactory->create(
            $params['name'] . '_' . time() . '.zip',
            [
                'type' => 'filename',
                'value' => $rootPath . '/' . $params['name'] . '_' . time() . '.zip',
                'rm' => true
            ],
            \Magento\Framework\App\Filesystem\DirectoryList::ROOT,
            'application/zip'
        );
        $this->makeDirectory->rmdir($rootPath, true);*/
    }
}