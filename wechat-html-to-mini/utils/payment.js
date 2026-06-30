function requestPayment(payParams) {
  return new Promise((resolve, reject) => {
    wx.requestPayment({
      timeStamp: payParams.timeStamp,
      nonceStr: payParams.nonceStr,
      package: payParams.package,
      signType: payParams.signType || 'RSA',
      paySign: payParams.paySign,
      success(res) {
        resolve(res)
      },
      fail(err) {
        if (err.errMsg && err.errMsg.indexOf('cancel') !== -1) {
          reject({ code: 'cancel', msg: '用户取消支付' })
        } else {
          reject({ code: 'fail', msg: '支付失败' })
        }
      }
    })
  })
}

module.exports = { requestPayment }
