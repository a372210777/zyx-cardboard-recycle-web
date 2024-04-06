





import request from '@/utils/request'



export function inAndOutOrderStatics(params) {
  return request({
    url: '/api/report/stock',
    method: 'get',
    params
  })
}



export default { inAndOutOrderStatics }

