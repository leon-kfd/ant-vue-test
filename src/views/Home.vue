<template>
  <div class="home">
    <standard-table v-model="conf1"
                    :row-key="record => record.userId"
                    ref="table1"
                    :loading.sync="loading" bordered>
      <!-- <span slot="sex"
            slot-scope="data"
            style="color: #48f;font-weight:bold">{{data.record.sex === 1 ? '男' : '女'}}</span> -->
    </standard-table>
  </div>
</template>

<script>
import StandardTable from '@/components/standard-table/src/standard-table'
export default {
  name: 'Home',
  components: {
    StandardTable
  },
  data () {
    return {
      loading: false,
      conf1: {
        row: [
          {
            title: '用户Id',
            dataIndex: 'userId'
          },
          {
            title: '用户名',
            dataIndex: 'userName'
          },
          {
            title: '性别',
            dataIndex: 'sex',
            formatter: (row) => row.sex === 1 ? '男' : '女',
            style: (row) => row.sex === 1 ? 'color: #49f' : 'color: #fa3'
          },
          {
            title: '职位',
            dataIndex: 'position'
          },
          {
            title: '生日',
            dataIndex: 'birth'
          }
        ],
        data: [],
        url: '/api/page',
        axiosMethod: 'get',
        pagination: {
          requestPage: 'page',
          requestPageSize: 'pageSize'
        },
        responseItems: 'data.data.items',
        responseTotal: 'data.data.total',
        operation: {
          btns: [
            {
              label: '测试',
              fn: (row) => {
                console.log(row)
              },
              disabled: (row) => row.sex === 1
            }
          ]
        }
      }
    }
  },
  mounted () {
    this.$nextTick(() => {
      this.$refs.table1.fetch()
    })
  }
}
</script>
