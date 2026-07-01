export type StepStatus = "pending" | "running" | "done"

export type StepCategory = "reasoning" | "rag" | "mcp" | "decision" | "action"

export interface TraceLog {
  /** 相对该步骤开始的时间偏移（毫秒），用于逐条揭示日志 */
  at: number
  text: string
  /** 可选的键值指标，展示在日志右侧 */
  meta?: string
}

export interface TraceStep {
  id: string
  category: StepCategory
  title: string
  /** 副标题，描述该步骤使用的工具或资源 */
  subtitle: string
  /** 步骤运行所需时长（毫秒） */
  duration: number
  logs: TraceLog[]
  /** 步骤完成后展示的结论 */
  result: string
}

export const CATEGORY_LABEL: Record<StepCategory, string> = {
  reasoning: "推理",
  rag: "知识检索",
  mcp: "MCP 调用",
  decision: "策略判定",
  action: "执行动作",
}

/** 触发退款流程的示例用户输入 */
export const SAMPLE_QUERY = "衣服发错尺码了，要求退款"

/** 智能体运行轨迹的完整步骤定义 */
export const TRACE_STEPS: TraceStep[] = [
  {
    id: "intent",
    category: "reasoning",
    title: "解析用户意图",
    subtitle: "LLM · gpt-4o · 意图分类",
    duration: 1600,
    logs: [
      { at: 100, text: "接收到用户消息，开始语义解析" },
      { at: 600, text: "识别意图：售后退款申请", meta: "置信度 0.96" },
      { at: 1100, text: "抽取关键实体：商品=衣服 · 问题=尺码错误" },
    ],
    result: "判定为「退款类」工单，进入售后处理流程。",
  },
  {
    id: "rag",
    category: "rag",
    title: "检索 RAG 售后政策",
    subtitle: "向量库 · policy-kb · top_k=3",
    duration: 2200,
    logs: [
      { at: 200, text: "向量化查询并检索知识库…" },
      { at: 900, text: "命中《7 天无理由退换货政策》", meta: "score 0.91" },
      { at: 1400, text: "命中《商家责任错发漏发处理条款》", meta: "score 0.88" },
      { at: 1900, text: "召回 3 条相关政策片段，构建上下文" },
    ],
    result: "错发商品属商家责任，支持全额退款且免退货运费。",
  },
  {
    id: "mcp",
    category: "mcp",
    title: "调用 MCP 服务端读取 Shopify 订单",
    subtitle: "MCP Server · shopify-orders · get_order",
    duration: 2400,
    logs: [
      { at: 200, text: "建立 MCP 连接 → shopify-orders" },
      { at: 800, text: "调用工具 get_order(order_id=#1043)", meta: "200 OK · 412ms" },
      { at: 1500, text: "读取订单：SKU 发货=US-M / 下单=US-S" },
      { at: 2000, text: "核验支付状态：已付款 · 可退款金额 ¥289.00" },
    ],
    result: "订单 #1043 存在尺码错发，支付正常，可发起退款。",
  },
  {
    id: "decision",
    category: "decision",
    title: "判定是否符合退款政策",
    subtitle: "规则引擎 · policy-match",
    duration: 1500,
    logs: [
      { at: 200, text: "比对政策条款与订单事实…" },
      { at: 700, text: "条件①下单 7 日内 ✓ · 条件②商家责任 ✓" },
      { at: 1200, text: "决策：符合全额退款条件", meta: "无需人工审批" },
    ],
    result: "满足全额退款条件，自动放行退款申请。",
  },
  {
    id: "action",
    category: "action",
    title: "发起退款并生成回执",
    subtitle: "MCP Server · payments · create_refund",
    duration: 1800,
    logs: [
      { at: 200, text: "调用 create_refund(amount=289.00, currency=CNY)" },
      { at: 900, text: "支付网关受理退款", meta: "refund_id RF-7782" },
      { at: 1400, text: "生成退款回执并推送用户" },
    ],
    result: "退款已发起，预计 1-3 个工作日原路退回。",
  },
]
