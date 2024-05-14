
import request from '@/utils/request'

// export function queryStockList(params) {
//   return request({
//     url: '/api/stock/queryStock',
//     method: 'get',
//     params
//   })
// }

export function queryStockList(params) {
  return request({
    url: '/api/inventory/query',
    method: 'get',
    params
  })
}

export default { queryStockList }

