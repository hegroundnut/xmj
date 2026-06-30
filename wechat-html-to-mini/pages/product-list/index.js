const { publicApi } = require('../../utils/api/index')

Page({
  data: {
    activeCat: '全部',
    categories: [],
    products: [],
    filteredProducts: [],
    loading: true,
    error: false
  },

  onLoad() {
    this.loadData()
  },

  loadData() {
    this.setData({ loading: true, error: false })
    publicApi.getProductList({}).then(res => {
      const products = (res.data && res.data.list) || res.data || []
      const catSet = new Set()
      products.forEach(p => {
        if (p.category_name) catSet.add(p.category_name)
      })
      const categories = ['全部', ...Array.from(catSet)]
      this.setData({
        products,
        categories,
        filteredProducts: products,
        loading: false
      })
    }).catch(() => {
      this.setData({ loading: false, error: true })
    })
  },

  onCatChange(e) {
    const cat = e.currentTarget.dataset.cat
    if (cat === this.data.activeCat) return
    const filtered = cat === '全部'
      ? this.data.products
      : this.data.products.filter(p => p.category_name === cat)
    this.setData({ activeCat: cat, filteredProducts: filtered })
  },

  onProductTap(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: '/pages/product-detail/index?id=' + id })
  }
})
