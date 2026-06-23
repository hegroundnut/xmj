<?php
namespace app\api\controller\v2;

use app\services\teaching\CaseFavoriteServices;

class CaseFavoriteController
{
    protected $services;

    public function __construct(CaseFavoriteServices $services)
    {
        $this->services = $services;
    }

    protected function uid()
    {
        return (int) request()->uid();
    }

    public function toggle($id)
    {
        $result = $this->services->toggleFavorite((int) $id, $this->uid());
        return app('json')->success(['action' => $result]);
    }

    public function favorites()
    {
        $where = request()->getMore([
            ['page', 1],
            ['limit', 10],
        ]);
        return app('json')->success(
            $this->services->getFavorites($this->uid(), (int)$where['page'], (int)$where['limit'])
        );
    }
}
