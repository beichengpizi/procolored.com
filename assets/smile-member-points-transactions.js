import { initializeSmileApi } from './smile-member-api.js'
// yg-moment 在 Shopify 环境中不可用，使用简单的日期格式化函数
function dateFormat(format, date) {
  // 兼容：Date 对象 或 可被 Date 解析的字符串
  let d = date;

  if (typeof date === 'string') {
    d = new Date(date);
  }

  if (!d || !(d instanceof Date) || isNaN(d.getTime())) {
    return '';
  }

  const pad = (n) => (n < 10 ? '0' + n : n);
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();

  return format
    .replace('YYYY', year)
    .replace('MM', pad(month))
    .replace('mm', pad(month))
    .replace('DD', pad(day))
    .replace('dd', pad(day));
}
import { Loading } from './smile-components-index.js'

// 用户活动历史 - Member Points Transactions
class MemberPointsTransactions extends window.HTMLElement {
  constructor() {
    super()

    // 每页显示的记录数
    this.limit = 10
    this.loading = new Loading()
  }

  // 生命周期钩子：当元素被插入到DOM中时调用
  connectedCallback() {
    this.initializeComponent() // 初始化组件
  }

  // 初始化函数，获取API和用户信息，并绑定事件监听器
  async initializeComponent() {
    const { customer, config, api } = await initializeSmileApi()
    this.MemberApi = api
    this.customer = customer
    this.config = config

    // 检查列表和分页元素是否存在
    if (!this.listElement || !this.paginationElement) {
      console.error('The required elements are not found in the DOM.')
      return
    }

    // 初始化列表内容
    await this.update()

    // 绑定点击事件，用于分页
    this.addEventListener('click', (event) => {
      const cursor = event.target?.dataset?.cursor
      if (cursor) {
        this.loadTransactionList({ limit: this.limit, cursor })
      }
    })
  }

  // 更新交易列表
  async update() {
    await this.loadTransactionList({ limit: this.limit, cursor: '' })
  }

  // 加载并渲染交易列表数据
  async loadTransactionList({ limit, cursor }) {
    try {
      // 显示加载动画
      this.loading.show({
        message: 'Please wait...',
        spinnerColor: 'text-accent' // 蓝色旋转图标
      })

      // 获取会员积分交易数据
      const { points_transactions: transactions, metadata } =
        await this.MemberApi.fetchAllPointsPointsTransactions(limit, cursor)

      // 渲染列表和分页组件
      this.listElement.innerHTML = this.renderTransactionList(transactions)
      this.paginationElement.innerHTML = this.renderPaginationButtons(metadata)

      // 显示或隐藏分页组件
      const { next_cursor: nextCursor, previous_cursor: previousCursor } =
        metadata
      this.paginationElement.classList.toggle(
        'hidden',
        !nextCursor && !previousCursor
      )
    } catch (error) {
      console.error('Failed to fetch points transactions:', error)
    } finally {
      // 移除加载动画
      this.loading.hide()
    }
  }

  // 渲染交易列表内容
  renderTransactionList(transactions) {
    if (!transactions.length) {
      return '<div class="min-h-40 lg:min-h-48">No transactions found.</div>'
    }

    // 将每个交易项渲染为HTML，并将所有项连接成一个字符串
    return transactions
      .map(
        (transaction) => `
        <div class="table-row odd:bg-gray-50">
          <div class="table-cell p-4">${dateFormat('mm/dd/YYYY', transaction.created_at)}</div>
          <div class="table-cell p-4">${transaction.description}</div>
          <div class="table-cell p-4">${transaction.points_change}</div>
          <div class="table-cell p-4">Approved</div>
        </div>`
      )
      .join('')
  }

  // 渲染分页按钮
  renderPaginationButtons({
    next_cursor: nextCursor,
    previous_cursor: previousCursor
  }) {
    if (!nextCursor && !previousCursor) {
      return ''
    }

    return `
      <button
        class="relative inline-flex items-center rounded-l-md px-2 py-2 text-white ring-1 ring-inset ring-accent-hover bg-accent hover:bg-accent-hover focus:z-20 focus:outline-offset-0 disabled:text-gray-400 disabled:bg-gray-200 disabled:cursor-no-drop transition-colors"
        ${previousCursor ? `data-cursor="${previousCursor}"` : 'disabled'}>
        <span class="sr-only pointer-events-none">Previous</span>
        <svg class="h-5 w-5 pointer-events-none" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd"/>
        </svg>
      </button>
      <button
        class="relative inline-flex items-center rounded-r-md px-2 py-2 text-white ring-1 ring-inset ring-accent-hover bg-accent hover:bg-accent-hover focus:z-20 focus:outline-offset-0 disabled:text-gray-400 disabled:bg-gray-200 disabled:cursor-no-drop transition-colors"
        ${nextCursor ? `data-cursor="${nextCursor}"` : 'disabled'}>
        <span class="sr-only pointer-events-none">Next</span>
        <svg class="h-5 w-5 pointer-events-none" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd"/>
        </svg>
      </button>`
  }

  // 获取交易列表的容器元素
  get listElement() {
    return this.querySelector('[data-list]')
  }

  // 获取分页的容器元素
  get paginationElement() {
    return this.querySelector('[data-pagination]')
  }
}

// 注册自定义元素
window.customElements.define(
  'member-points-transactions',
  MemberPointsTransactions
)
