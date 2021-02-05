var config = {
    map: {
        '*': {
            fabric  :'https://cdnjs.cloudflare.com/ajax/libs/fabric.js/2.3.3/fabric.min.js',
            react: 'https://unpkg.com/react@16/umd/react.production.min.js',
            // react: 'https://unpkg.com/react@16/umd/react.development.js',
            reactdom: 'https://unpkg.com/react-dom@16/umd/react-dom.production.min.js',
            // reactdom: 'https://unpkg.com/react-dom@16/umd/react-dom.development.js',
            babel: 'https://unpkg.com/babel-standalone@6.15.0/babel.min.js',
            axios: 'https://unpkg.com/axios/dist/axios.min.js',
            jqueryUiTouch: 'Mahadckap_Productimize/js/jquery.ui.touch-punch.min',
            THREE: 'Mahadckap_Productimize/js/three',
            OrbitControls: 'Mahadckap_Productimize/js/OrbitControls',
            GLTFLoader: 'Mahadckap_Productimize/js/GLTFLoader',
            TWEEN: 'https://devcloud.productimize.com/Promize3d/libraries/Tween.js',
            customisedOptions: 'Mahadckap_Productimize/js/customise-options',
            selectric:'Mahadckap_Productimize/js/selectric',
            owlCarousel:'Mahadckap_Productimize/js/owl.carousel',
            'Magento_Checkout/template/minicart/item/default.html': 'Mahadckap_Productimize/template/minicart/item/default.html',
            'Magento_Checkout/template/summary/item/details.html': 'Mahadckap_Productimize/template/summary/item/details.html'
        }
    },
    paths: {
        'pdfjs-dist/build/pdf': 'https://devcloud.productimize.com/Promize3d/libraries/pdf',
        'pdfjs-dist/build/pdf.worker': 'https://devcloud.productimize.com/Promize3d/libraries/pdf.worker',
    },
    config: {
        mixins: {
            'Magento_Wishlist/js/add-to-wishlist': {  // Target module
                'Mahadckap_Productimize/js/add-to-wishlist-mixin': true  // Extender module
            },
            'Magento_Catalog/js/catalog-add-to-cart': {
                'Mahadckap_Productimize/js/catalog-add-to-cart-mixin': true  // Extender module
            }
        }
    }
}
