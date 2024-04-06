
import request from '@/utils/request'

//入库数据统计
export function stockIn(params) {
  return request({
    url: '/api/report/chart/stockIn',
    method: 'get',
    params
  })
}



//出库数据统计
export function stockOut(params) {
    return request({
      url: '/api/report/chart/stockOut',
      method: 'get',
      params
    })
  }
  
  
//出库金额统计
export function stockOutMoney(params) {
  return request({
    url: '/api/report/chart/stockOutMoney',
    method: 'get',
    params
  })
}
  
export default { stockIn,stockOut,stockOutMoney }
