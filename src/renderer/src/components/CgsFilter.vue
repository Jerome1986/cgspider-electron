<script setup lang="ts">
import { Search } from '@element-plus/icons-vue'
import { ref } from 'vue'
import { CheckboxValueType } from 'element-plus'
import { useCategoryStore, useMaterialStore, usePageTypeStore, useTagStore, useUserStore } from '@/stores'

// 定义 Store
const pageTypeStore = usePageTypeStore()
const categoryStore = useCategoryStore()
const tagStore = useTagStore()
const materialStore = useMaterialStore()
const userStore = useUserStore()

// 处理分页--每页条数
const handleSizeChange = async (size: number) => {
  materialStore.setPageSize(size)
  materialStore.setPageNum(1)
  searchValue.value = ''
  isSearch.value = false

  // 渲染数据
  await materialStore.materialListFilterGet(
    pageTypeStore.currentPageType,
    categoryStore.currentCateId,
    categoryStore.currentSubCateId,
    categoryStore.currentThirdCateId,
    tagStore.selectedAittribuleIds,
    tagStore.selectedColorIds,
    false,
    false,
    userStore.userInfo._id
  )
}

// 处理翻页
const handleCurrentChange = async (current: number) => {
  materialStore.setPageNum(current)
  // 如果搜索存在--优先根据搜索内容
  if (isSearch.value) {
    await materialStore.searchKeywords(pageTypeStore.currentPageType, searchValue.value)
  } else {
    // 渲染数据
    await materialStore.materialListFilterGet(
      pageTypeStore.currentPageType,
      categoryStore.currentCateId,
      categoryStore.currentSubCateId,
      categoryStore.currentThirdCateId,
      tagStore.selectedAittribuleIds,
      tagStore.selectedColorIds,
      false,
      false,
      userStore.userInfo._id
    )
  }
}

// 处理搜索
const searchValue = ref('')
// 清空搜索
const handleClear = async () => {
  searchValue.value = ''
  isSearch.value = false
  materialStore.setPageNum(1)
  // 渲染素材
  await materialStore.materialListFilterGet(
    pageTypeStore.currentPageType,
    categoryStore.currentCateId,
    categoryStore.currentSubCateId,
    categoryStore.currentThirdCateId,
    tagStore.selectedAittribuleIds,
    tagStore.selectedColorIds,
    false,
    false,
    userStore.userInfo._id
  )
}

// 点击查询--搜索
const isSearch = ref(false) // 记录搜索状态
const searchGetMaterial = async () => {
  console.log('查询', searchValue.value)
  isSearch.value = true
  // 搜索之前重置页码
  materialStore.setPageNum(1)
  await materialStore.searchKeywords(pageTypeStore.currentPageType, searchValue.value)
}

// 处理筛选
const checkListFilter = ref([])
const changeFilter = async (value: CheckboxValueType[]) => {
  const collect = value.includes('collect')
  const download = value.includes('download')

  // 重置页码再筛选
  materialStore.setPageNum(1)

  // 重置搜索
  searchValue.value = ''
  isSearch.value = false

  // 渲染素材
  await materialStore.materialListFilterGet(
    pageTypeStore.currentPageType,
    categoryStore.currentCateId,
    categoryStore.currentSubCateId,
    categoryStore.currentThirdCateId,
    tagStore.selectedAittribuleIds,
    tagStore.selectedColorIds,
    download,
    collect,
    userStore.userInfo._id
  )
}

// 重置筛选
const resetFilter = async () => {
  console.log('重置筛选')
  checkListFilter.value = []
  materialStore.showText = false
  searchValue.value = ''
  // 渲染素材
  await materialStore.materialListFilterGet(
    pageTypeStore.currentPageType,
    categoryStore.currentCateId,
    categoryStore.currentSubCateId,
    categoryStore.currentThirdCateId,
    tagStore.selectedAittribuleIds,
    tagStore.selectedColorIds,
    false,
    false,
    userStore.userInfo._id
  )
}
</script>

<template>
  <div class="filter">
    <!--  分页  -->
    <div class="example-pagination-block">
      <el-pagination
        v-model:current-page="materialStore.pageNum"
        v-model:page-size="materialStore.pageSize"
        background
        :page-sizes="[1, 10, 50, 80, 100]"
        layout="total, sizes, prev, pager, next"
        :total="materialStore.materialTotal"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
    <!-- 搜索 -->
    <div class="search">
      <el-input
        v-model="searchValue"
        class="custom-input"
        placeholder="请输入关键词"
        :prefix-icon="Search"
        clearable
        @clear="handleClear"
        @keydown.enter="searchGetMaterial"
      />
      <div class="searchBtn" @click="searchGetMaterial">查询</div>
    </div>
    <!--   筛选区   -->
    <div class="filter">
      <el-checkbox-group v-model="checkListFilter" @change="changeFilter">
        <el-checkbox label="本机有" value="download" />
        <el-checkbox label="已收藏" value="collect" />
      </el-checkbox-group>
      <!--  单独控制--显示文本  -->
      <el-checkbox v-model="materialStore.showText" label="显示信息" style="color: #ffffff" />
      <!-- 重置所有筛选 -->
      <div class="reset" @click="resetFilter">重置</div>
    </div>
  </div>
</template>

<style scoped lang="scss">
/*筛选和分页*/
.filter {
  display: flex;
  align-items: center;
  padding: 8px;
  height: 50px;
  background-color: $cgs-side;
  border-top: 1px solid $cgs-border;
  border-bottom: 1px solid $cgs-border;

  /*分页*/
  .example-pagination-block {
    :deep(.el-pagination.is-background) {
      .btn-prev,
      .btn-next,
      .el-pager li {
        background-color: transparent;
        color: #fff;
        border: none;
        box-shadow: none;
        margin: 0 3px;

        &:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }

        &.is-active {
          background-color: transparent;
          color: #ffffff;
        }

        &.is-active,
        &:hover,
        &:focus,
        &.disabled {
          background-color: transparent;
          box-shadow: none;
        }
      }

      .btn-prev,
      .btn-next {
        background-color: transparent;
        box-shadow: none;
        border: none;

        &:disabled {
          background-color: transparent;
          box-shadow: none;
        }

        &:hover,
        &:focus {
          background-color: transparent;
          box-shadow: none;
        }
      }
    }
  }

  /*搜索*/
  .search {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 8px;
    max-width: 1000px; // 搜索框最大宽度
    margin-left: 8px;
    margin-right: 40px;
    font-size: 14px;

    /*搜索框*/
    .custom-input {
      width: 100%;
      flex: 1;

      :deep(.el-input__wrapper) {
        background-color: #2f2f2f;
        box-shadow: none;
        border-radius: 20px;
        height: 30px;
        padding-left: 12px; // 调整左侧内边距
      }

      :deep(.el-input__inner) {
        color: #fff;
      }
    }

    /*搜索按钮*/
    .searchBtn {
      margin-left: 8px;
      cursor: pointer;

      &:hover {
        color: $cgs-brandColor;
      }
    }
  }

  /*筛选*/
  .filter {
    display: flex;
    align-items: center;
    gap: 40px; // 复选框组和重置按钮之间的间距

    :deep(.el-checkbox-group) {
      display: flex;
      gap: 16px; // 复选框之间的间距

      .el-checkbox {
        /* 未选中状态的文字颜色 */
        .el-checkbox__label {
          color: #fff;
        }

        /* 选中状态的文字颜色 */
        &.is-checked {
          .el-checkbox__label {
            color: $cgs-brandColor;
          }
        }

        /* 选中状态的复选框颜色 */
        .el-checkbox__input.is-checked {
          .el-checkbox__inner {
            background-color: $cgs-brandColor;
            border-color: $cgs-brandColor;
          }
        }
      }
    }

    .reset {
      font-size: 14px;
      cursor: pointer;

      &:hover {
        color: $cgs-brandColor;
      }
    }
  }
}
</style>
