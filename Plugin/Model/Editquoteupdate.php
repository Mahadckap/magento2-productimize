<?php

namespace Mahadckap\Productimize\Plugin\Model;

class Editquoteupdate
{
    /**
     * @var \Magento\Framework\App\RequestInterface
     */
    protected $request;
    /**
     * @var \Magento\Framework\App\Response\RedirectInterface
     */
    protected $redirect;
    /**
     * @var \Magento\Sales\Api\OrderRepositoryInterface
     */
    protected $orderRepository;

    public function __construct(
        \Magento\Framework\App\RequestInterface $request,
        \Magento\Framework\App\Response\RedirectInterface $redirect,
        \Magento\Sales\Api\OrderRepositoryInterface $orderRepository
    )
    {
        $this->request = $request;
        $this->redirect = $redirect;
        $this->orderRepository = $orderRepository;
    }

    public function beforeAddProduct(
        \Magento\Quote\Model\Quote $subject,
        \Magento\Catalog\Model\Product $product,
        $request = null,
        $processMode = \Magento\Catalog\Model\Product\Type\AbstractType::PROCESS_MODE_FULL
    )
    {
           $params = $this->request->getParams();
        $items = $subject->getAllItems();
        $referenURL = $this->redirect->getRefererUrl();
        $selectedCustomizedoptions = [];
        if (isset($params['pz_cart_properties'])) {
            if ($params['pz_cart_properties'] != '') {
                $addedParams = json_decode($params['pz_cart_properties'], true);
                if (is_array($addedParams)) {
                    if (!empty($addedParams)) {
                        foreach ($addedParams as $addedParamlabel => $addedParamValue) {
                            if($addedParamlabel != 'CustomImage') {
                                $selectedCustomizedoptions[] = [
                                    'label' => $addedParamlabel,
                                    'value' => $addedParamValue
                                ];
                            }
                        }
                    }
                }
            }
        }
        if (strpos($referenURL, 'wishlist') !== false) {
            if ($request->getData()) {
                if ($request->getData('pz_cart_properties')) {
                    if ($request->getData('pz_cart_properties') != '') {
                        $addedParams = json_decode($request->getData('pz_cart_properties'), true);
                        if (is_array($addedParams)) {
                            if (!empty($addedParams)) {
                                foreach ($addedParams as $addedParamlabel => $addedParamValue) {
                                    if($addedParamlabel != 'CustomImage') {
                                        $selectedCustomizedoptions[] = [
                                            'label' => $addedParamlabel,
                                            'value' => $addedParamValue
                                        ];
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        if (isset($params['order_id'])) {
            if ($request->getData('productimize_options')) {
                $selectedCustomizedoptions = $request->getData('productimize_options');
            }
        }

        $product->addCustomOption('additional_options', json_encode($selectedCustomizedoptions));

        return [$product, $request, $processMode];
    }
}
