<?php

namespace Mahadckap\Productimize\Controller\Index;

class Insert extends \Magento\Framework\App\Action\Action
{
    public function execute()
    {
        $objectManager = \Magento\Framework\App\ObjectManager::getInstance(); // Instance of object manager
        $resource = $objectManager->create('Magento\Framework\App\ResourceConnection');
        $connection = $resource->getConnection();

        $csv = $objectManager->create('Magento\Framework\File\Csv');

        $fileSystem = $objectManager->get(\Magento\Framework\App\Filesystem\DirectoryList::class);
        $entities = ['media', 'treatment', 'media_treatment', 'base_cost', 'frame_treatment'];
        foreach ($entities as $item) {
            $mediaPath = $fileSystem->getPath('var') . '/import/' . $item . '.csv';
            $csvData = $csv->getData($mediaPath);
            foreach ($csvData as $row => $data) {
                if ($row > 0) {
                    if ($item == 'media') {
                        $insertData = [
                            'sku' => $data[0],
                            'base_cost_media' => $data[1],
                            'display_name' => $data[2],
                            'display_to_customer' => 1,
                            'min_image_size_short' => $data[3],
                            'min_image_size_long' => $data[4],
                            'max_image_size_short' => $data[5],
                            'max_image_size_long' => $data[6]
                        ];
                    }
                    if ($item == 'treatment') {
                        $insertData = [
                            'treatment_sku' => $data[0],
                            'base_cost_treatment' => $data[1],
                            'display_name' => $data[2],
                            'requires_top_mat' => $data[8],
                            'requires_bottom_mat' => $data[9],
                            'requires_liner' => $data[10],
                            'min_glass_size_short' => $data[3],
                            'min_glass_size_long' => $data[4],
                            'max_glass_size_short' => $data[5],
                            'max_glass_size_long' => $data[6],
                            'min_rabbet_depth' => $data[7],
                            'image_edge_treatment' => $data[11],
                            'new_top_mat_size_left' => $data[12],
                            'new_top_mat_size_top' => $data[13],
                            'new_top_mat_size_right' => $data[14],
                            'new_top_mat_size_bottom' => $data[15],
                            'new_bottom_mat_size_left' => $data[16],
                            'new_bottom_mat_size_top' => $data[17],
                            'new_bottom_mat_size_right' => $data[18],
                            'new_bottom_mat_size_bottom' => $data[19]
                        ];
                    }
                    if ($item == 'media_treatment') {
                        $insertData = [
                            'media_sku' => $data[0],
                            'treatment_sku' => $data[1],
                            'display_to_customer' => $data[2]
                        ];
                    }
                    if ($item == 'base_cost') {
                        $insertData = [
                            'base_cost_media' => $data[0],
                            'base_cost_treatment' => $data[1],
                            'glass_size_short' => $data[2],
                            'glass_size_long' => $data[3],
                            'base_cost' => $data[4]
                        ];
                    }

                    if ($item == 'frame_treatment') {
                        $insertData = [
                            'treatment_sku' => $data[0],
                            'frame_type' => $data[1]
                        ];
                    }

                    $connection->insert($item, $insertData);

                }
            }
        }

    }
}