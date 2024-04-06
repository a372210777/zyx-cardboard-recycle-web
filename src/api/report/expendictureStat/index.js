


import request from '@/utils/request'



export function expenseStatics(params) {
  return request({
    url: '/api/report/expense',
    method: 'get',
    params
  })
}



export default { expenseStatics }

