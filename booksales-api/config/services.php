<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    // Key dan host harus sepasang (salah pasangan = "invalid credentials"):
    //   sandbox: dp_test_... -> api-sandbox.durianpay.id, halaman bayar di checkout-sandbox.durianpay.id
    //   live   : dp_live_... -> api.durianpay.id,         halaman bayar di checkout.durianpay.id
    'durianpay' => [
        'secret_key' => env('DURIANPAY_SECRET_KEY'),
        'base_url' => env('DURIANPAY_BASE_URL', 'https://api-sandbox.durianpay.id/v1'),
        'checkout_url' => env('DURIANPAY_CHECKOUT_URL', 'https://checkout-sandbox.durianpay.id'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

];
