<template>
  <div class="__standard-table">
    <div class="__table-box">
      <a-table v-bind="{ ...($STANDARD ? $STANDARD.defaultTableOptions : {}),...$attrs}"
               v-on="$listeners"
               :columns="conf.row"
               :data-source="conf.data"
               :loading="loading"
               :pagination="false"
               ref="table">
        <template v-for="item in slotRowList"
                  :slot="item.scopedSlots.customRender"
                  slot-scope="text, record, index">
          <slot :name="item.scopedSlots.customRender"
                v-bind="{text, record, index}"></slot>
        </template>
        <template v-if="conf.operation"
                  slot="_operation"
                  slot-scope="text, record">
          <template v-for="item in conf.operation.btns">
            <a-button v-if="item.show ? item.show(record) : true"
                      :key="item.label"
                      :type="item.type || 'link'"
                      :size="item.size || 'small'"
                      :disabled="item.disabled ? item.disabled(record) : false"
                      :style="(item.style && typeof item.style == 'function') ? item.style(record) : item.style"
                      @click="item.fn && item.fn(record)">{{typeof item.label == 'function' ? item.label(record) : item.label}}</a-button>
          </template>
        </template>
      </a-table>
    </div>
    <div class="__footer-box">
      <div class="__footer-btn-box">
        <slot name="footerLeft"></slot>
      </div>
      <div class="__pagination-box"
           v-if="conf.pagination"
           :style="{'text-align': (conf.pagination && conf.pagination.align) || 'right'}">
        <a-pagination @change="handleCurrentChange"
                      @showSizeChange="handleSizeChange"
                      v-model="currentPage"
                      :pageSize="currentPageSize"
                      show-size-changer
                      :pageSizeOptions="(conf.pagination && conf.pagination.pageSizes) || this.$STANDARD.pageSizes"
                      :total="total" />
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { clone } from '../utils/object-method'
export default {
  name: 'StandardTable',
  model: {
    prop: 'conf',
    event: 'update'
  },
  props: {
    conf: Object,
    loading: {
      default: false,
      type: Boolean
    }
  },
  data () {
    return {
      currentPage: 1,
      currentPageSize: 20,
      total: 0,
      isStaticPagination: false,
      staticData: []
    }
  },
  computed: {
    slotRowList () {
      return this.conf.row.filter(item => item.scopedSlots)
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    init () {
      this.isStaticPagination = (this.conf.pagination && this.conf.pagination.static) || false
      this.currentPageSize = (this.conf.pagination && this.conf.pagination.pageSize) || this.$STANDARD.pageSize
      if (this.isStaticPagination) {
        this.total = this.conf.data.length
        this.staticData = this.conf.data
      }
      if (this.conf.operation) {
        const operationConf = {
          title: '操作',
          key: '_operation',
          scopedSlots: { customRender: '_operation' },
          ...this.conf.operation
        }
        this.conf.row.push(operationConf)
      }
    },
    handleSizeChange (curr, val) {
      this.currentPageSize = val
      this.currentPage = 1
      if (this.isStaticPagination) {
        this.staticPagination()
      } else {
        this.fetch()
      }
    },
    handleCurrentChange (val) {
      this.currentPage = val
      if (this.isStaticPagination) {
        this.staticPagination()
      } else {
        this.fetch()
      }
    },
    staticPagination () {
      this.conf.data = this.staticData.slice(((this.currentPage - 1) * this.currentPageSize), this.currentPage * this.currentPageSize)
    },
    getMap (result, mapRule) {
      const mapItems = mapRule ? mapRule.split('.') : []
      mapItems.map(item => {
        if (typeof result !== 'undefined' && result !== null) {
          result = item ? result[item] : result
        } else {
          this.$message ? this.$message.error(`返回${mapRule}映射失败,请检查Map配置与后端返回数据是否配置正确..`) : alert(`返回${mapRule}映射失败,请检查Map配置与后端返回数据是否配置正确..`)
          throw new Error('规则映射出错')
        }
      })
      return result
    },
    fetch () {
      return new Promise((resolve, reject) => {
        this.$emit('update:loading', true)
        const params = this.conf.params || {}
        if (this.conf.pagination && !this.isStaticPagination) {
          const page = this.conf.pagination.requestPage || this.$STANDARD.requestPage
          const pageSize = this.conf.pagination.requestPageSize || this.$STANDARD.requestPageSize
          params[page] = this.currentPage
          params[pageSize] = this.currentPageSize
        }
        const method = this.conf.axiosMethod || this.$STANDARD.axiosMethod
        const config = Object.assign(this.$STANDARD.axiosConfig, this.conf.axiosConfig)
        let instance
        if (this.$STANDARD.axiosInstance) {
          if (method === 'post') {
            instance = this.$STANDARD.axiosInstance.post(this.conf.url, params)
          } else {
            instance = this.$STANDARD.axiosInstance.get(this.conf.url, { params })
          }
        } else {
          instance = axios({
            ...config,
            method,
            url: this.conf.url,
            data: method === 'post' && params,
            params: method === 'get' && params
          })
        }
        instance.then(data => {
          if (this.conf.formatRespone && typeof this.conf.formatRespone === 'function') {
            data = this.conf.formatRespone(data)
          }
          if (data) {
            const resultItems = this.getMap(data, typeof this.conf.responseItems === 'undefined' ? this.$STANDARD.responseItems : this.conf.responseItems)
            if (typeof resultItems !== 'undefined' && resultItems !== null) {
              if (!this.conf.pagination) {
                if (this.conf.fixedRender) {
                  this.conf.cloneData = clone(resultItems)
                  this.conf.data = resultItems.slice(0, this.conf.fixedRender.length)
                  this.renderFakeRow()
                } else {
                  this.conf.data = resultItems
                }
              } else if (this.conf.pagination && this.isStaticPagination) {
                this.staticData = resultItems
                this.total = this.staticData.length || 0
                this.staticPagination()
              } else {
                this.conf.data = resultItems
                if (this.conf.pagination) {
                  const resultTotal = this.getMap(data, typeof this.conf.responseTotal === 'undefined' ? this.$STANDARD.responseTotal : this.conf.responseTotal)
                  if (typeof resultTotal !== 'undefined' && resultTotal !== null) {
                    this.total = resultTotal
                  } else {
                    this.$message ? this.$message.error('返回数据total字段映射失败,请检查Map配置与后端返回数据是否配置正确..') : alert('返回数据total字段映射失败,请检查Map配置与后端返回数据是否配置正确..')
                  }
                }
              }
            } else {
              this.$message ? this.$message.error('返回数据items字段映射失败,请检查Map配置与后端返回数据是否正确...') : alert('返回数据items字段映射失败,请检查Map配置与后端返回数据是否正确...')
            }
            resolve(data)
            this.$emit('update:loading', false)
          }
        }, data => {
          reject(data)
          this.$emit('update:loading', false)
        })
      })
    }
  }
}
</script>
<style lang='scss' scoped>
.__footer-box {
  margin: 15px 0;
  zoom: 1;
}
.__footer-box:after {
  content: '';
  display: table;
  clear: both;
}
.__footer-btn-box {
  float: left;
}
.__pagination-box {
  float: right;
}
</style>
