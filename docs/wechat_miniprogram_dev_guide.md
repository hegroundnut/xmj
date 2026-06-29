# 微信小程序开发指南：支付、沙箱支付与快捷登录

## 1. 微信支付

微信小程序支付允许用户在小程序内完成商品或服务的支付。其核心流程涉及商户后端调用微信支付接口下单，小程序前端唤起支付收银台。

### 1.1 平台配置

1.  **注册与认证**：首先需注册微信公众平台账号（小程序类型）并完成认证。未认证账号无法申请小程序支付权限 [1]。
2.  **商户号申请与绑定**：
    *   **已有商户号**：超级管理员登录商户平台，申请JSAPI支付权限（小程序支付场景），并发起APPID的授权绑定 [1]。
    *   **新商户号**：参考指引申请新商户号和JSAPI支付权限，支持个体工商户、企业、事业单位、政府机关、社会组织等主体类型 [1]。
3.  **公众平台确认绑定**：登录公众平台，确认授权绑定的商户号，完成商户号与公众平台APPID绑定 [1]。
4.  **配置技术负责人**：为技术负责人配置商户平台登录账号并设置为安全联系人 [1]。
5.  **获取开发参数**：获取开发所需的各项参数，并在开发过程中记录Request-ID以便排查问题 [1]。
6.  **交易类小程序规范**：若为交易类小程序，需满足公众平台的《交易类小程序运营规范》，接入订单发货管理功能，否则可能被限制支付权限 [1]。

### 1.2 开发指引与代码实现

整体业务开发流程概览如下 [2]：

1.  **商户下单**：商户后端通过调用 **JSAPI/小程序下单接口** 获取预支付交易会话标识（`prepay_id`）。
    *   **接口说明**：`POST /v3/pay/transactions/jsapi` [3]。
    *   **请求参数**：
        *   `appid`：公众账号ID。
        *   `mchid`：商户号。
        *   `description`：商品描述。
        *   `out_trade_no`：商户订单号。
        *   `time_expire`（可选）：支付结束时间，遵循RFC3339标准格式，最长15天。若不传，默认7天 [3]。
        *   `attach`（可选）：商户数据包。
        *   `notify_url`：商户接收支付成功回调通知的地址。
        *   `amount`：订单金额，包含`total`（总金额，单位分）和`currency`（货币类型，固定CNY） [3]。
        *   `payer`：支付者信息，包含`openid`（用户在商户appid下的唯一标识） [3]。
    *   **应答参数**：

        | 参数名 | 类型 | 说明 |
        | --- | --- | --- |
        | `prepay_id` | string(64) | 预支付交易会话标识，JSAPI或小程序调起支付时需要使用的参数，有效期为2小时，失效后需要重新请求该接口以获取新的`prepay_id` [3]。 |

    *   **应答示例**：

        ```json
        {
          "prepay_id": "wx201410272009395522657a690389285100"
        }
        ```

    *   **注意事项**：前端下单按钮需进行防抖处理，防止重复支付 [2]。

2.  **商户调起支付**：小程序前端通过 `wx.requestPayment` 方法拉起微信收银台 [2]。

    ```javascript
    wx.requestPayment({
      timeStamp: '', // 时间戳
      nonceStr: '', // 随机字符串
      package: '', // 统一下单接口返回的 prepay_id 参数值，格式如：prepay_id=***
      signType: 'RSA', // 签名算法，默认RSA
      paySign: '', // 签名
      success (res) { },
      fail (res) { }
    })
    ```

3.  **用户支付与结果处理**：
    *   用户完成支付或取消支付后，小程序页面会收到 `requestPayment` 的回调。此时商户需调用 **查询订单API** 接口确认订单状态，并根据状态展示支付结果 [2]。
    *   支付成功后，微信支付系统会发送 **支付成功回调通知** 给商户 [2]。
    *   若需限制用户支付时间，可在下单时设置 `time_expire`，或在商户系统内进行倒计时并关单 [2]。

4.  **对账与退款**：商户可通过下载交易账单进行对账，并调用退款接口完成退款 [2]。

## 2. 微信支付沙箱环境

微信支付沙箱环境（仿真测试系统）提供给开发者模拟支付及回调通知，用于验证商户是否理解回调通知、账单格式，以及是否对异常做了正确的处理。沙箱环境与生产环境完全独立，所有交易均为无资金流的假数据 [4]。

### 2.1 平台配置

1.  **API调用URL修改**：商户开发者只需将正式API的调用URL增加一层 `xdc/apiv2sandbox` 路径，即可对接到仿真系统 [4]。
    *   例如：付款码支付URL `https://api.mch.weixin.qq.com/pay/micropay` 变更为 `https://api.mch.weixin.qq.com/xdc/apiv2sandbox/pay/micropay` [4]。
2.  **获取沙箱验签密钥**：沙箱环境的API验签密钥需通过特定API获取 [4]：
    *   **请求URL**：`https://api.mch.weixin.qq.com/xdc/apiv2getsignkey/sign/getsignkey`
    *   **请求方式**：`POST`
    *   **请求参数**：`mch_id`（商户号）、`nonce_str`（随机字符串）、`sign`（签名）
    *   **返回参数**：

        | 字段名 | 字段 | 必填 | 示例值 | 类型 | 说明 |
        | --- | --- | --- | --- | --- | --- |
        | `return_code` | 返回状态码 | 是 | SUCCESS | String(16) | SUCCESS/FAIL 此字段是通信标识，非交易标识 [4] |
        | `return_msg` | 返回信息 | 否 | 签名失败 | String(128) | 返回信息，如非空，为错误原因，签名失败，参数格式校验错误 [4] |
        | `mch_id` | 商户号 | 是 | 1305638280 | String(32) | 微信支付分配的微信商户号 [4] |
        | `sandbox_signkey` | 沙箱密钥 | 否 | 013467007045764 | String(32) | 返回的沙箱密钥 [4] |

    *   **返回示例**：

        ```xml
        <xml>
          <return_code><![CDATA[SUCCESS]]></return_code>
          <return_msg><![CDATA[OK]]></return_msg>
          <mch_id><![CDATA[1305638280]]></mch_id>
          <sandbox_signkey><![CDATA[013467007045764]]></sandbox_signkey>
        </xml>
        ```
        （注：V2接口返回XML格式，V3接口通常返回JSON格式。此处沙箱密钥获取接口为V2接口，故示例为XML）

### 2.2 代码实现

在代码中，主要修改API请求地址，将正式环境的URL替换为沙箱环境的URL。其他签名、参数构造等逻辑与正式环境基本一致，但需使用沙箱环境获取的密钥进行签名 [4]。

## 3. 微信小程序快捷登录

微信小程序快捷登录允许用户通过微信官方提供的登录能力，快速建立小程序内的用户体系，并可选择获取用户手机号。

### 3.1 登录流程时序与平台配置

1.  **小程序端调用 `wx.login()`**：获取 **临时登录凭证code**，并回传到开发者服务器 [5]。
    *   `wx.login()` 接口用于获取用户登录凭证（code）。

    ```javascript
    wx.login({
      success (res) {
        if (res.code) {
          // 发送 res.code 到后台换取 openId, sessionKey, unionId
          console.log('登录成功！' + res.code)
        } else {
          console.log('登录失败！' + res.errMsg)
        }
      }
    })
    ```

2.  **开发者服务器调用 `auth.code2Session` 接口**：换取 **用户唯一标识 OpenID**、**UnionID**（若已绑定开放平台账号）和 **会话密钥 session_key** [5]。
    *   **接口说明**：`GET https://api.weixin.qq.com/sns/jscode2session` [7]。
    *   **请求参数**：`appid`、`secret`、`js_code`、`grant_type`（固定为`authorization_code`） [7]。
    *   **返回参数**：

        | 参数名 | 类型 | 说明 |
        | --- | --- | --- |
        | `session_key` | string | 会话密钥 [7] |
        | `unionid` | string | 用户在开放平台的唯一标识符，若当前小程序已绑定到微信开放平台帐号下会返回 [7] |
        | `openid` | string | 用户唯一标识 [7] |
        | `errcode` | number | 错误码，请求失败时返回 [7] |
        | `errmsg` | string | 错误信息，请求失败时返回 [7] |

    *   **返回示例**：

        ```json
        {
          "openid": "xxxxxx",
          "session_key": "xxxxx",
          "unionid": "xxxxx",
          "errcode": 0,
          "errmsg": "xxxxx"
        }
        ```

    *   **注意事项**：`session_key` 不应下发到小程序，也不应对外提供，以保证数据安全 [5]。`code` 只能使用一次 [5]。

3.  **开发者服务器生成自定义登录态**：根据获取到的用户标识生成自定义登录态，用于后续业务逻辑中前后端交互时识别用户身份 [5]。

### 3.2 手机号快速验证组件

该能力允许开发者在用户同意后获取平台验证后的手机号。自2023年8月28日起，此组件将付费使用，每个小程序账号有1000次体验额度 [6]。

1.  **平台配置**：
    *   该接口目前针对非个人主体且完成认证的小程序开放 [6]。
    *   需在微信公众平台购买资源包或使用体验额度 [6]。

2.  **使用方法与代码实现**：
    *   **步骤1**：将 `button` 组件的 `open-type` 值设置为 `getPhoneNumber`，并通过 `bindgetphonenumber` 事件获取回调信息 [6]。

        ```html
        <button open-type="getPhoneNumber" bindgetphonenumber="getPhoneNumber"></button>
        ```

    *   **步骤2**：将 `bindgetphonenumber` 事件回调中的动态令牌 `code` 传到开发者后台，并在后台调用微信后台提供的 `phonenumber.getPhoneNumber` 接口，消费 `code` 来换取用户手机号。每个 `code` 有效期5分钟，只能消费一次 [6]。
        *   **接口说明**：`POST https://api.weixin.qq.com/wxa/business/getuserphonenumber?access_token=ACCESS_TOKEN` [8]。
        *   **请求参数**：`access_token`（接口调用凭证）、`code`（手机号获取凭证） [8]。
        *   **返回参数**：

            | 参数名 | 类型 | 说明 |
            | --- | --- | --- |
            | `errcode` | number | 错误码 [8] |
            | `errmsg` | string | 错误信息 [8] |
            | `phone_info` | object | 用户手机号信息 [8] |
            | `phone_info.phoneNumber` | string | 用户绑定的手机号（国外手机号会有区号） [8] |
            | `phone_info.purePhoneNumber` | string | 没有区号的手机号 [8] |
            | `phone_info.countryCode` | string | 区号 [8] |
            | `phone_info.watermark` | object | 数据水印 [8] |

        *   **返回示例**：

            ```json
            {
              "errcode": 0,
              "errmsg": "ok",
              "phone_info": {
                "phoneNumber": "xxxxxx",
                "purePhoneNumber": "xxxxxx",
                "countryCode": "86",
                "watermark": {
                  "timestamp": 1637744274,
                  "appid": "xxxx"
                }
              }
            }
            ```

        ```javascript
        Page({
          getPhoneNumber (e) {
            console.log(e.detail.code) // 动态令牌
            console.log(e.detail.errMsg) // 回调信息（成功失败都会返回）
            console.log(e.detail.errno) // 错误码（失败时返回）
            // 将 e.detail.code 发送到后端进行手机号解密
          }
        })
        ```

    *   **注意**：`getPhoneNumber` 返回的 `code` 与 `wx.login` 返回的 `code` 作用不同，不能混用 [6]。从基础库2.21.2开始，获取手机号信息的方式进行了安全升级，新方式不再需要提前调用 `wx.login` [6]。

## 4. 总结

微信小程序提供了完善的支付和登录体系。开发者在接入时，应仔细阅读官方文档，理解其平台配置要求和开发流程。对于支付功能，需关注商户号申请、权限配置、API调用参数及回调处理；对于沙箱支付，需注意API地址的切换和沙箱密钥的获取；对于快捷登录，则需掌握 `wx.login` 的使用以及手机号快速验证组件的接入流程和付费规则。

## 5. 参考文献

[1] 微信支付商户文档中心. 开发接入准备_小程序支付. [https://pay.weixin.qq.com/doc/v3/merchant/4015459512](https://pay.weixin.qq.com/doc/v3/merchant/4015459512)
[2] 微信支付商户文档中心. 开发指引_小程序支付. [https://pay.weixin.qq.com/doc/v3/merchant/4012791911](https://pay.weixin.qq.com/doc/v3/merchant/4012791911)
[3] 微信支付商户文档中心. JSAPI/小程序下单. [https://pay.weixin.qq.com/doc/v3/merchant/4012791856](https://pay.weixin.qq.com/doc/v3/merchant/4012791856)
[4] 微信支付商户文档中心. 支付验收指引_通用规则. [https://pay.weixin.qq.com/doc/v2/merchant/4011984810](https://pay.weixin.qq.com/doc/v2/merchant/4011984810)
[5] 微信开放文档. 小程序登录. [https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/login.html](https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/login.html)
[6] 微信开放文档. 手机号快速验证组件. [https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/getPhoneNumber.html](https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/getPhoneNumber.html)
[7] 微信开放文档. 小程序登录凭证校验. [https://developers.weixin.qq.com/miniprogram/dev/server/API/user-login/api_code2session.html](https://developers.weixin.qq.com/miniprogram/dev/server/API/user-login/api_code2session.html)
[8] 微信开放文档. 获取手机号. [https://developers.weixin.qq.com/miniprogram/dev/server/API/user-info/phone-number/api_getphonenumber.html](https://developers.weixin.qq.com/miniprogram/dev/server/API/user-info/phone-number/api_getphonenumber.html)
