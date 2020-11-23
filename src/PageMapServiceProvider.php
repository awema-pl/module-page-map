<?php

namespace AwemaPL\PageMap;

use AwemaPL\BaseJS\AwemaProvider;

class PageMapServiceProvider extends AwemaProvider
{

    public function getPackageName(): string
    {
        return 'page-map';
    }

    public function getPath(): string
    {
       return __DIR__;
    }
}
