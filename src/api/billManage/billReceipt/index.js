import request from '@/utils/request'

export function add(data) {
  return request({
    url: 'api/statement',
    method: 'post',
    data
  })
}

//删除对账单某一种物料
export function del(ids) {
  return request({
    url: 'api/statement/item',
    method: 'delete',
    data: ids
  })
}

export function edit(data) {
  return request({
    url: 'api/statement',
    method: 'put',
    data
  })
}

export function queryData(params) {
  return request({
    url: 'api/statement',
    method: 'get',
    params
  })
}




export function staticsByMonth(params) {
  return request({
    url: '/api/statement/add',
    method: 'get',
    params
  })
}

//修改对账单单行项
export function modifyStatementItem(data) {
  return request({
    url: '/api/statement/item',
    method: 'put',
    data
  })
}








export default { add, edit, del,staticsByMonth,queryData,modifyStatementItem }
