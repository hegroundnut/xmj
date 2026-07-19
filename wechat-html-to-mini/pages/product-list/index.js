const { publicApi } = require('../../utils/api/index')

Page({
  data: {
    activeCat: '全部',
    categories: [],
    products: [],
    filteredProducts: [],
    loading: true,
    error: false,
    statusBarHeight: 20,
    navHeight: 0
  },

  onLoad() {
    const sys = wx.getSystemInfoSync()
    const capsule = wx.getMenuButtonBoundingClientRect()
    this.setData({ statusBarHeight: sys.statusBarHeight, navHeight: capsule.bottom + (capsule.top - sys.statusBarHeight) })
    this.loadData()
  },

  loadData() {
    this.setData({ loading: true, error: false })
    Promise.all([
      publicApi.getProductCategories(),
      publicApi.getProductList({})
    ]).then(([catRes, prodRes]) => {
      const cats = (catRes.data || []).map(c => c.name)
      const rawList = (prodRes.data && prodRes.data.list) || prodRes.data || []
      const products = (Array.isArray(rawList) ? rawList : [rawList]).map(p => ({
        id: p.id,
        name: p.title || p.name,
        subtitle: p.desc || p.subtitle || '',
        image: (p.banner && p.banner[0]) || p.image || p.thumb || '',
        is_hot: p.is_hot,
        tag: p.tag,
        category_name: p.category_name,
        price: p.price || 0
      }))
      this.setData({
        categories: ['全部', ...cats],
        products: products,
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
    if (id) {
      wx.navigateTo({ url: '/pages/product-detail/index?id=' + id })
    }
  },

  onBack() {
    wx.navigateBack()
  }
})
