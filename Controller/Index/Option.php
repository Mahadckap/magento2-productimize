<?php

namespace Mahadckap\Productimize\Controller\Index;

use Magento\Framework\App\Action\Action;
use Magento\Framework\Controller\Result\JsonFactory;
use Magento\Framework\View\Result\PageFactory;
use Magento\Framework\App\Action\Context;
use Psr\Log\LoggerInterface;
use Mahadckap\Productimize\Model\ProductimizeCalculation;

class Option extends Action
{
    protected $_resultPageFactory;
    protected $_resultJsonFactory;
    protected $_logger;
    protected $_calc;

    public function __construct(Context $context, PageFactory $resultPageFactory, JsonFactory $resultJsonFactory, LoggerInterface $logger, ProductimizeCalculation $calc)
    {
        parent::__construct($context);
        $this->_resultPageFactory = $resultPageFactory;
        $this->_resultJsonFactory = $resultJsonFactory;
        $this->_logger = $logger;
        $this->_calc = $calc;
    }

    public function execute()
    {
        try {
            $resultJson = $this->_resultJsonFactory->create();
            $type = $this->getRequest()->getParam("type");
            $selectedMediumOption = $this->getRequest()->getParam("selectedMedium");
            $selectedTreatmentOption = $this->getRequest()->getParam("selectedTreatment");
            $finalArray = [];

            if ($type == "size") {
                $finalArray = $this->_calc->getSizeCalculation($selectedMediumOption, $selectedTreatmentOption);
            }

            if ($type == "liner") {
                $finalArray = $this->_calc->getLinerCalculation($selectedMediumOption, $selectedTreatmentOption);
            }
            $result['status'] = __('true');
            $result['content'] = $finalArray;
            return $resultJson->setData($result);

        } catch (\Exception $e) {
            $this->_logger->info(print_r($e->getMessage(), true));
            $status['error'] = __('error');
            return $resultJson->setData($e->getMessage());
        }

    }
}
