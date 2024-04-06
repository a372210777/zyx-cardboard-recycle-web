import request from '@/utils/request'

export function querySupplier(params) {
  return request({
    url: 'api/basicSupplier',
    method: 'get',
    params
  })
}

export function queryMaterial(params) {
  return request({
    url: 'api/basicMaterial',
    method: 'get',
    params
  })
}

export function queryWarehouse(params) {
  return request({
    url: 'api/basicWarehouse',
    method: 'get',
    params
  })
}
//采购商
export function queryBuyer(params) {
  return request({
    url: 'api/basicBuyer',
    method: 'get',
    params
  })
}
//承运商
export function queryCarrier(params) {
  return request({
    url: 'api/basicCarrier',
    method: 'get',
    params
  })
}


export default { querySupplier, queryMaterial, queryWarehouse,queryBuyer,queryCarrier }
