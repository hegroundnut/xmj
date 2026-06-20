module.exports = {
	// 灏忕▼搴?/ APP璇锋眰閰嶇疆
	// #ifdef MP || APP-PLUS
	// 璇锋眰鍩熷悕 鏍煎紡锛?https://鎮ㄧ殑鍩熷悕
	HTTP_REQUEST_URL: `http://127.0.0.1:8011`,
	// #endif

	// H5璇锋眰閰嶇疆
	// #ifdef H5
	// H5鎺ュ彛鏄祻瑙堝櫒鍦板潃锛岄潪鍗曠嫭閮ㄧ讲涓嶇敤淇敼
	HTTP_REQUEST_URL: window.location.protocol + "//" + window.location.host,
	// #endif 

	// 浠ヤ笅閰嶇疆鍦ㄤ笉鍋氫簩寮€鐨勫墠鎻愪笅,涓嶉渶瑕佸仛浠讳綍鐨勪慨鏀?
	HEADER: {
		'content-type': 'application/json',
		//#ifdef H5
		'Form-type': navigator.userAgent.toLowerCase().indexOf("micromessenger") !== -1 ? 'wechat' : 'h5',
		//#endif
		//#ifdef MP
		'Form-type': 'routine',
		//#endif
		//#ifdef APP-VUE
		'Form-type': 'app',
		//#endif
	},
	// 鍥炶瘽瀵嗛挜鍚嶇О 璇峰嬁淇敼姝ら厤缃?
	TOKENNAME: 'Authori-zation',
	// 缂撳瓨鏃堕棿 0 姘镐箙
	EXPIRE: 0,
	//鍒嗛〉鏈€澶氭樉绀烘潯鏁?
	LIMIT: 10,
	// 璇锋眰瓒呮椂闄愬埗 榛樿10绉?
	TIMEOUT: 100000
}

