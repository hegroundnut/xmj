function formatTime(date) {
  const d = new Date(date * 1000)
  const year = d.getFullYear()
  const month = ('0' + (d.getMonth() + 1)).slice(-2)
  const day = ('0' + d.getDate()).slice(-2)
  return `${year}-${month}-${day}`
}

function debounce(fn, delay) {
  let timer = null
  return function (...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, args), delay)
  }
}

function previewImage(urls, current) {
  wx.previewImage({ urls, current: current || urls[0] })
}

module.exports = { formatTime, debounce, previewImage }
