/**
 * 微信支付 XML 工具(纯字符串处理,不引入 xml2js 等依赖)
 *
 * 微信支付 V2 接口的请求/响应均使用 XML 格式,顶层固定为 <xml>,子节点形如:
 *   <KEY>VALUE</KEY>  或  <KEY><![CDATA[VALUE]]></KEY>
 */

/**
 * 解析微信 XML 字符串为 plain object
 * 仅解析顶层 <xml> 下的直接子节点,返回 { KEY: VALUE, ... }
 * @param {String} xmlString 微信 XML 字符串
 * @returns {Object} 解析后的对象
 */
function parseXml(xmlString) {
  const result = {}
  if (!xmlString || typeof xmlString !== 'string') return result

  // 匹配 <KEY>VALUE</KEY> 或 <KEY><![CDATA[VALUE]]></KEY>
  // match[1] = KEY, match[2] = CDATA 内容, match[3] = 普通文本内容
  const regex = /<(\w+)>(?:<!\[CDATA\[([\s\S]*?)\]\]>|([^<]*))<\/\1>/g
  let match
  while ((match = regex.exec(xmlString)) !== null) {
    const key = match[1]
    // CDATA 内容优先,否则取普通文本
    const value = match[2] !== undefined ? match[2] : (match[3] !== undefined ? match[3] : '')
    result[key] = value
  }
  return result
}

/**
 * 序列化对象为微信 XML 字符串
 * 每个值用 <KEY><![CDATA[VALUE]]></KEY> 包裹,顶层 <xml>...</xml>
 * @param {Object} obj 待序列化的对象
 * @returns {String} XML 字符串
 */
function buildXml(obj) {
  if (!obj || typeof obj !== 'object') return ''
  let xml = '<xml>'
  for (const key of Object.keys(obj)) {
    const raw = obj[key]
    const value = (raw === undefined || raw === null) ? '' : String(raw)
    xml += `<${key}><![CDATA[${value}]]></${key}>`
  }
  xml += '</xml>'
  return xml
}

module.exports = {
  parseXml,
  buildXml
}
