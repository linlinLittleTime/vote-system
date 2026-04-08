"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Step {
  title: string;
  content: string;
  image?: string;
}

interface Section {
  id: string;
  title: string;
  icon: string;
  steps: Step[];
}

const manualSections: Section[] = [
  {
    id: "create",
    title: "创建投票活动",
    icon: "📝",
    steps: [
      {
        title: "步骤一：访问首页",
        content: "打开浏览器，访问系统首页。左侧为活动创建表单，右侧为样式预览区域。",
        image: "home",
      },
      {
        title: "步骤二：选择展示样式",
        content: "点击顶部样式选项卡，选择喜欢的投票展示样式。右侧会实时预览效果。",
        image: "style",
      },
      {
        title: "步骤三：填写活动信息",
        content: "填写活动标题（必填）、描述（选填），然后添加投票选项。",
        image: "form",
      },
      {
        title: "步骤四：上传选项图片（可选）",
        content: "每个选项可以上传本地图片（<100KB）或填写图片URL。点击「上传」按钮选择图片。",
        image: "upload",
      },
      {
        title: "步骤五：设置投票规则",
        content: "选择「单选」或「多选」。多选时可设置最大可选数。",
        image: "rule",
      },
      {
        title: "步骤六：创建活动",
        content: "点击「创建活动」按钮，系统会自动创建活动并跳转到活动详情页。",
        image: "submit",
      },
    ],
  },
  {
    id: "vote",
    title: "参与投票",
    icon: "🗳️",
    steps: [
      {
        title: "方式一：扫码投票",
        content: "使用微信或浏览器扫描活动二维码，直接进入投票页面。",
        image: "qrcode",
      },
      {
        title: "方式二：链接投票",
        content: "复制投票链接，在浏览器中打开即可参与投票。",
        image: "link",
      },
      {
        title: "步骤三：选择选项",
        content: "点击要投票的选项，多选时可选择多个。已选择的选项会高亮显示。",
        image: "select",
      },
      {
        title: "步骤四：提交投票",
        content: "确认选择后，点击「提交投票」按钮完成投票。投票后可查看实时结果。",
        image: "vote-submit",
      },
    ],
  },
  {
    id: "screen",
    title: "大屏展示",
    icon: "🖥️",
    steps: [
      {
        title: "步骤一：打开大屏页面",
        content: "在活动详情页点击「打开大屏展示」按钮，或直接访问大屏链接。",
        image: "screen-open",
      },
      {
        title: "步骤二：全屏显示",
        content: "按 F11 键进入全屏模式，适合投屏到电视或投影仪。",
        image: "fullscreen",
      },
      {
        title: "步骤三：实时刷新",
        content: "大屏会每5秒自动刷新数据，无需手动操作。投票数据变化时会有动画效果。",
        image: "screen-refresh",
      },
    ],
  },
  {
    id: "admin",
    title: "管理后台",
    icon: "🔐",
    steps: [
      {
        title: "步骤一：登录后台",
        content: "访问 /admin/login，输入管理员Token登录。Token在环境变量中配置。",
        image: "admin-login",
      },
      {
        title: "步骤二：查看活动列表",
        content: "登录后可看到所有活动列表，支持搜索、筛选、分页。",
        image: "admin-list",
      },
      {
        title: "步骤三：管理活动状态",
        content: "可将活动设置为「草稿」「进行中」「已结束」三种状态。",
        image: "admin-status",
      },
      {
        title: "步骤四：导出数据",
        content: "点击「导出」按钮，可选择CSV或Excel格式导出投票数据。",
        image: "admin-export",
      },
      {
        title: "步骤五：查看统计",
        content: "点击侧边栏「统计看板」，查看投票趋势图和热门活动排行。",
        image: "admin-dashboard",
      },
    ],
  },
];

// 界面示意图组件
function ScreenMock({ type }: { type: string }) {
  const mockScreens: Record<string, JSX.Element> = {
    home: (
      <div className="bg-gray-100 rounded-lg p-2 w-full max-w-3xl mx-auto">
        <div className="flex gap-2">
          {/* 左侧表单 */}
          <div className="w-64 bg-white rounded-lg p-3 shadow">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center text-white text-sm">🗳️</div>
              <div className="text-sm font-bold">创建投票活动</div>
            </div>
            <div className="space-y-2">
              <div className="bg-gray-100 rounded p-2 text-xs text-gray-400">活动标题输入框</div>
              <div className="bg-gray-100 rounded p-2 text-xs text-gray-400">活动描述输入框</div>
              <div className="bg-gray-50 rounded p-2 border">
                <div className="text-xs text-gray-500 mb-1">选项 1</div>
                <div className="bg-gray-100 rounded h-6 text-xs"></div>
              </div>
              <div className="bg-gray-50 rounded p-2 border">
                <div className="text-xs text-gray-500 mb-1">选项 2</div>
                <div className="bg-gray-100 rounded h-6 text-xs"></div>
              </div>
              <div className="border-2 border-dashed border-gray-300 rounded p-2 text-xs text-gray-400 text-center">+ 添加选项</div>
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded p-2 text-white text-xs text-center">🚀 创建活动</div>
            </div>
          </div>
          {/* 右侧预览 */}
          <div className="flex-1 bg-gray-800 rounded-lg p-3">
            <div className="bg-white/20 rounded-full px-3 py-1 text-xs text-white mb-2 inline-block">📊 实时预览</div>
            <div className="space-y-2">
              <div className="bg-white/10 rounded p-2 flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-500 rounded"></div>
                <div className="flex-1 bg-gray-600 rounded h-4"></div>
                <div className="text-white text-xs">42%</div>
              </div>
              <div className="bg-white/10 rounded p-2 flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-500 rounded"></div>
                <div className="flex-1 bg-gray-600 rounded h-4 w-3/4"></div>
                <div className="text-white text-xs">38%</div>
              </div>
              <div className="bg-white/10 rounded p-2 flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-500 rounded"></div>
                <div className="flex-1 bg-gray-600 rounded h-4 w-1/2"></div>
                <div className="text-white text-xs">20%</div>
              </div>
            </div>
          </div>
        </div>
        {/* 标注 */}
        <div className="mt-2 flex justify-around">
          <div className="flex items-center gap-1 text-xs text-purple-600">
            <span className="w-4 h-4 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs">1</span>
            <span>表单区域</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-blue-600">
            <span className="w-4 h-4 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">2</span>
            <span>预览区域</span>
          </div>
        </div>
      </div>
    ),
    style: (
      <div className="bg-gray-100 rounded-lg p-2 w-full max-w-3xl mx-auto">
        <div className="bg-white/10 rounded-lg p-2 mb-2">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-sm text-white">🎨 样式：</span>
            <div className="bg-white text-purple-600 rounded px-3 py-1 text-xs">📊 经典柱状图</div>
            <div className="bg-white/20 text-white rounded px-3 py-1 text-xs">🎴 卡片流</div>
            <div className="bg-white/20 text-white rounded px-3 py-1 text-xs">💎 水晶柱</div>
            <div className="bg-white/20 text-white rounded px-3 py-1 text-xs">🌊 液态柱</div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <div className="text-white/60 text-xs mb-2">点击样式按钮切换预览效果</div>
          <div className="flex justify-center gap-1">
            <div className="w-8 h-4 bg-purple-500 rounded animate-pulse"></div>
            <div className="w-6 h-4 bg-blue-500 rounded"></div>
            <div className="w-4 h-4 bg-green-500 rounded"></div>
          </div>
        </div>
        {/* 箭头指示 */}
        <div className="mt-2 text-center">
          <span className="text-xs text-gray-500">↑ 点击切换样式，右侧实时预览</span>
        </div>
      </div>
    ),
    form: (
      <div className="bg-gray-100 rounded-lg p-2 w-full max-w-sm mx-auto">
        <div className="bg-white rounded-lg p-4 shadow space-y-3">
          <div>
            <div className="text-xs text-gray-500 mb-1">活动标题 <span className="text-red-500">*</span></div>
            <div className="bg-gray-100 border rounded p-2 text-sm">最佳创意奖投票</div>
            <div className="text-right text-xs text-gray-400 mt-1">8/50</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">活动描述 <span className="text-gray-400">(选填)</span></div>
            <div className="bg-gray-100 border rounded p-2 text-sm text-gray-400">请为您最喜欢的创意投票...</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">投票选项 <span className="text-red-500">*</span> <span className="text-gray-400">(3/10)</span></div>
            <div className="space-y-2">
              <div className="bg-gray-50 rounded p-2 border flex items-center gap-2">
                <span className="w-5 h-5 bg-purple-100 text-purple-600 rounded text-xs flex items-center justify-center">1</span>
                <div className="flex-1 text-sm">创意方案A</div>
                <span className="text-red-400 text-xs">✕</span>
              </div>
              <div className="bg-gray-50 rounded p-2 border flex items-center gap-2">
                <span className="w-5 h-5 bg-purple-100 text-purple-600 rounded text-xs flex items-center justify-center">2</span>
                <div className="flex-1 text-sm">创意方案B</div>
                <span className="text-red-400 text-xs">✕</span>
              </div>
              <div className="bg-gray-50 rounded p-2 border flex items-center gap-2">
                <span className="w-5 h-5 bg-purple-100 text-purple-600 rounded text-xs flex items-center justify-center">3</span>
                <div className="flex-1 text-sm">创意方案C</div>
                <span className="text-red-400 text-xs">✕</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    upload: (
      <div className="bg-gray-100 rounded-lg p-2 w-full max-w-sm mx-auto">
        <div className="bg-gray-50 rounded-lg p-3 border">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded text-xs flex items-center justify-center">1</span>
            <div className="flex-1 bg-white border rounded p-1 text-sm">选项名称</div>
            <span className="text-red-400 text-xs">✕</span>
          </div>
          {/* 图片上传区域 */}
          <div className="bg-white rounded p-2 border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="relative">
                <div className="w-16 h-12 bg-purple-100 rounded flex items-center justify-center">
                  <span className="text-2xl">🏞️</span>
                </div>
                <button className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs">×</button>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <button className="px-2 py-1 bg-purple-50 text-purple-600 border border-purple-200 rounded">📤 上传</button>
              <span className="text-gray-300">或</span>
              <div className="flex-1 bg-gray-100 rounded p-1 text-gray-400">图片URL</div>
            </div>
            <div className="text-gray-400 text-xs mt-1">支持本地上传(&lt;100KB)或URL链接</div>
          </div>
        </div>
        {/* 箭头指示 */}
        <div className="mt-2 text-center">
          <span className="text-xs text-purple-600">↑ 点击「上传」按钮选择本地图片</span>
        </div>
      </div>
    ),
    rule: (
      <div className="bg-gray-100 rounded-lg p-2 w-full max-w-sm mx-auto">
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="text-sm text-gray-700 mb-2">投票规则</div>
          <div className="flex gap-2 mb-3">
            <div className="flex-1 border-2 border-purple-500 bg-purple-50 rounded p-2 text-center text-xs text-purple-600">
              🔘 单选
            </div>
            <div className="flex-1 border border-gray-200 rounded p-2 text-center text-xs text-gray-500">
              ☑️ 多选
            </div>
          </div>
          {/* 多选设置 */}
          <div className="bg-gray-50 rounded p-3 border">
            <div className="text-xs text-gray-500 mb-1">最大可选数</div>
            <div className="flex items-center gap-2">
              <input type="number" value="3" readOnly className="w-20 bg-white border rounded p-1 text-sm" />
              <span className="text-xs text-gray-400">当前可选 1-5 项</span>
            </div>
          </div>
        </div>
        {/* 说明 */}
        <div className="mt-2 flex gap-4 justify-center text-xs">
          <span className="text-purple-600">📌 单选：每人只能投一票</span>
          <span className="text-blue-600">📌 多选：可投多票</span>
        </div>
      </div>
    ),
    submit: (
      <div className="bg-gray-100 rounded-lg p-2 w-full max-w-sm mx-auto">
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="space-y-3">
            <div className="bg-gray-100 rounded p-2 text-xs text-gray-500">活动有效期设置...</div>
            <div className="bg-gray-100 rounded p-2 text-xs text-gray-500">活动状态选择...</div>
            {/* 提交按钮 */}
            <button className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl text-sm shadow-lg">
              🚀 创建活动
            </button>
          </div>
        </div>
        {/* 箭头指示 */}
        <div className="mt-2 text-center">
          <span className="text-xs text-green-600">↓ 点击创建，跳转到活动详情页</span>
        </div>
      </div>
    ),
    qrcode: (
      <div className="bg-gray-100 rounded-lg p-2 w-full max-w-2xl mx-auto">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 shadow text-center">
            <div className="text-lg mb-2">📱 扫码投票</div>
            <div className="w-32 h-32 bg-gray-200 mx-auto rounded-lg flex items-center justify-center">
              <div className="text-4xl">📷</div>
            </div>
            <div className="text-xs text-gray-500 mt-2">扫描二维码参与投票</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow text-center">
            <div className="text-lg mb-2">🖥️ 大屏展示</div>
            <div className="flex flex-col items-center justify-center h-32">
              <button className="px-4 py-2 bg-purple-500 text-white rounded-lg text-sm">打开大屏展示</button>
              <div className="text-xs text-gray-400 mt-2">适合投屏到电视</div>
            </div>
          </div>
        </div>
        {/* 箭头指示 */}
        <div className="mt-2 text-center">
          <span className="text-xs text-purple-600">↑ 活动创建成功后显示此页面</span>
        </div>
      </div>
    ),
    link: (
      <div className="bg-gray-100 rounded-lg p-2 w-full max-w-sm mx-auto">
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="text-xs text-gray-500 mb-1">投票链接：</div>
          <div className="bg-gray-50 rounded p-2 text-sm text-purple-600 break-all">
            https://your-app.vercel.app/vote/abc123
          </div>
          <div className="flex gap-2 mt-2">
            <button className="flex-1 py-1 bg-purple-100 text-purple-600 rounded text-xs">📋 复制链接</button>
            <button className="flex-1 py-1 bg-gray-100 text-gray-600 rounded text-xs">📤 分享</button>
          </div>
        </div>
      </div>
    ),
    select: (
      <div className="bg-gray-100 rounded-lg p-2 w-full max-w-sm mx-auto">
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="text-center text-gray-500 text-sm mb-3">请选择选项（最多3项）</div>
          <div className="space-y-2">
            <div className="p-3 border-2 border-purple-500 bg-purple-50 rounded flex items-center gap-2">
              <div className="w-5 h-5 rounded border-2 border-purple-500 bg-purple-500 flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              <span>选项 A</span>
              <span className="ml-auto text-xs text-purple-600">已选</span>
            </div>
            <div className="p-3 border-2 border-purple-500 bg-purple-50 rounded flex items-center gap-2">
              <div className="w-5 h-5 rounded border-2 border-purple-500 bg-purple-500 flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              <span>选项 B</span>
              <span className="ml-auto text-xs text-purple-600">已选</span>
            </div>
            <div className="p-3 border rounded flex items-center gap-2 opacity-50">
              <div className="w-5 h-5 rounded border-2 border-gray-300"></div>
              <span>选项 C</span>
              <span className="ml-auto text-xs text-gray-400">已达上限</span>
            </div>
          </div>
        </div>
        <div className="mt-2 text-center text-xs text-gray-500">已选择 2/3 项</div>
      </div>
    ),
    "vote-submit": (
      <div className="bg-gray-100 rounded-lg p-2 w-full max-w-sm mx-auto">
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="space-y-2 mb-4">
            <div className="p-2 bg-purple-50 border border-purple-200 rounded flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              <span className="text-sm flex-1">选项 A</span>
              <span className="text-purple-600 text-sm">42%</span>
            </div>
            <div className="p-2 bg-gray-50 border rounded flex items-center gap-2">
              <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
              <span className="text-sm flex-1">选项 B</span>
              <span className="text-gray-600 text-sm">38%</span>
            </div>
          </div>
          <button className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-xl text-sm">
            提交投票 (2项)
          </button>
        </div>
        <div className="mt-2 text-center">
          <span className="text-xs text-green-600">↑ 确认后点击提交</span>
        </div>
      </div>
    ),
    "screen-open": (
      <div className="bg-gray-100 rounded-lg p-2 w-full max-w-sm mx-auto">
        <div className="bg-white rounded-lg p-4 shadow text-center">
          <div className="text-lg mb-3">🖥️ 大屏展示</div>
          <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl">
            打开大屏展示
          </button>
          <div className="text-xs text-gray-400 mt-2">适合投屏到电视或投影仪</div>
        </div>
      </div>
    ),
    fullscreen: (
      <div className="bg-gray-100 rounded-lg p-2 w-full max-w-2xl mx-auto">
        <div className="bg-gray-900 rounded-lg p-4 aspect-video flex items-center justify-center">
          <div className="text-center">
            <div className="text-white text-2xl mb-4">📊 最佳创意奖投票</div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-white text-sm w-20">选项 A</span>
                <div className="flex-1 bg-gray-700 rounded-full h-6 overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-full w-2/3 rounded-full"></div>
                </div>
                <span className="text-white text-sm">42票</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white text-sm w-20">选项 B</span>
                <div className="flex-1 bg-gray-700 rounded-full h-6 overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-full w-1/2 rounded-full"></div>
                </div>
                <span className="text-white text-sm">38票</span>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-2 text-center">
          <span className="text-xs text-gray-500">按 F11 进入全屏模式</span>
        </div>
      </div>
    ),
    "screen-refresh": (
      <div className="bg-gray-100 rounded-lg p-2 w-full max-w-md mx-auto">
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-600">🔄 自动刷新</span>
            <span className="text-xs text-green-500 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              实时更新中
            </span>
          </div>
          <div className="bg-gray-50 rounded p-3 text-center text-xs text-gray-500">
            每5秒自动刷新投票数据<br/>
            无需手动操作
          </div>
        </div>
      </div>
    ),
    "admin-login": (
      <div className="bg-gray-100 rounded-lg p-2 w-full max-w-sm mx-auto">
        <div className="bg-slate-800 rounded-lg p-6 text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl mx-auto mb-3 flex items-center justify-center text-2xl">
            🔐
          </div>
          <div className="text-white text-lg mb-1">管理后台</div>
          <div className="text-gray-400 text-xs mb-4">请输入管理员Token登录</div>
          <input
            type="password"
            placeholder="请输入Token"
            readOnly
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm mb-3"
          />
          <button className="w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg text-sm">
            登录
          </button>
        </div>
      </div>
    ),
    "admin-list": (
      <div className="bg-gray-100 rounded-lg p-2 w-full max-w-2xl mx-auto">
        {/* 统计卡片 */}
        <div className="grid grid-cols-5 gap-1 mb-2">
          <div className="bg-slate-800 rounded p-2 text-center">
            <div className="text-gray-400 text-xs">活动总数</div>
            <div className="text-white font-bold">12</div>
          </div>
          <div className="bg-slate-800 rounded p-2 text-center">
            <div className="text-gray-400 text-xs">进行中</div>
            <div className="text-green-400 font-bold">5</div>
          </div>
          <div className="bg-slate-800 rounded p-2 text-center">
            <div className="text-gray-400 text-xs">草稿</div>
            <div className="text-gray-400 font-bold">3</div>
          </div>
          <div className="bg-slate-800 rounded p-2 text-center">
            <div className="text-gray-400 text-xs">已结束</div>
            <div className="text-red-400 font-bold">4</div>
          </div>
          <div className="bg-slate-800 rounded p-2 text-center">
            <div className="text-gray-400 text-xs">总票数</div>
            <div className="text-purple-400 font-bold">1,234</div>
          </div>
        </div>
        {/* 搜索筛选 */}
        <div className="bg-white rounded p-2 mb-2 flex gap-2">
          <input placeholder="搜索活动..." className="flex-1 px-2 py-1 border rounded text-xs" readOnly />
          <select className="px-2 py-1 border rounded text-xs bg-white">
            <option>全部状态</option>
            <option>进行中</option>
            <option>草稿</option>
            <option>已结束</option>
          </select>
        </div>
        {/* 表格 */}
        <div className="bg-white rounded overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">标题</th>
                <th className="p-2">状态</th>
                <th className="p-2">票数</th>
                <th className="p-2">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                <td className="p-2">活动标题示例</td>
                <td className="p-2 text-center"><span className="px-2 py-0.5 bg-green-100 text-green-600 rounded text-xs">进行中</span></td>
                <td className="p-2 text-center">156</td>
                <td className="p-2 text-center text-purple-600">查看 | 编辑 | 删除</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    ),
    "admin-status": (
      <div className="bg-gray-100 rounded-lg p-2 w-full max-w-sm mx-auto">
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="text-sm text-gray-600 mb-2">活动状态</div>
          <div className="space-y-2">
            <div className="p-2 border-2 border-purple-500 bg-purple-50 rounded flex items-center gap-2">
              <span className="w-3 h-3 bg-yellow-400 rounded-full"></span>
              <span className="text-sm">草稿</span>
              <span className="ml-auto text-xs text-purple-600">未公开</span>
            </div>
            <div className="p-2 border rounded flex items-center gap-2">
              <span className="w-3 h-3 bg-green-400 rounded-full"></span>
              <span className="text-sm">进行中</span>
              <span className="ml-auto text-xs text-gray-400">可投票</span>
            </div>
            <div className="p-2 border rounded flex items-center gap-2">
              <span className="w-3 h-3 bg-red-400 rounded-full"></span>
              <span className="text-sm">已结束</span>
              <span className="ml-auto text-xs text-gray-400">已关闭</span>
            </div>
          </div>
        </div>
        <div className="mt-2 text-center text-xs text-gray-500">点击切换活动状态</div>
      </div>
    ),
    "admin-export": (
      <div className="bg-gray-100 rounded-lg p-2 w-full max-w-sm mx-auto">
        <div className="bg-white rounded-lg p-4 shadow text-center">
          <div className="text-lg mb-3">📥 导出数据</div>
          <div className="flex gap-2">
            <button className="flex-1 py-2 bg-green-500 text-white rounded text-sm">
              📄 导出CSV
            </button>
            <button className="flex-1 py-2 bg-blue-500 text-white rounded text-sm">
              📊 导出Excel
            </button>
          </div>
          <div className="text-xs text-gray-400 mt-2">导出所有投票记录</div>
        </div>
      </div>
    ),
    "admin-dashboard": (
      <div className="bg-gray-100 rounded-lg p-2 w-full max-w-lg mx-auto">
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="text-lg mb-3">📊 统计看板</div>
          {/* 趋势图 */}
          <div className="bg-gray-50 rounded p-3 mb-3">
            <div className="text-xs text-gray-500 mb-2">近7天投票趋势</div>
            <div className="flex items-end gap-1 h-16">
              <div className="flex-1 bg-purple-200 rounded-t" style={{ height: "40%" }}></div>
              <div className="flex-1 bg-purple-300 rounded-t" style={{ height: "60%" }}></div>
              <div className="flex-1 bg-purple-400 rounded-t" style={{ height: "80%" }}></div>
              <div className="flex-1 bg-purple-500 rounded-t" style={{ height: "100%" }}></div>
              <div className="flex-1 bg-purple-400 rounded-t" style={{ height: "70%" }}></div>
              <div className="flex-1 bg-purple-300 rounded-t" style={{ height: "50%" }}></div>
              <div className="flex-1 bg-purple-200 rounded-t" style={{ height: "30%" }}></div>
            </div>
          </div>
          {/* 热门活动 */}
          <div className="text-xs text-gray-500 mb-1">热门活动</div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs">
              <span className="w-4 text-yellow-500">🥇</span>
              <span className="flex-1">最佳创意奖</span>
              <span className="text-purple-600">256票</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="w-4 text-gray-400">🥈</span>
              <span className="flex-1">团队之星评选</span>
              <span className="text-purple-600">189票</span>
            </div>
          </div>
        </div>
      </div>
    ),
  };

  return mockScreens[type] || <div className="text-gray-400 text-center">示意图加载中...</div>;
}

export default function ManualPage() {
  const [activeSection, setActiveSection] = useState("create");
  const [activeStep, setActiveStep] = useState(0);

  const currentSection = manualSections.find((s) => s.id === activeSection);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* 左侧导航 */}
      <div className="w-64 bg-white border-r fixed h-full overflow-y-auto">
        <div className="p-4 border-b bg-gradient-to-r from-purple-600 to-pink-600">
          <h1 className="text-xl font-bold text-white">📖 操作手册</h1>
          <p className="text-purple-200 text-sm mt-1">炫酷投票系统</p>
        </div>
        <nav className="p-2">
          {manualSections.map((section) => (
            <button
              key={section.id}
              onClick={() => {
                setActiveSection(section.id);
                setActiveStep(0);
              }}
              className={`w-full text-left px-4 py-3 rounded-lg mb-1 flex items-center gap-3 transition ${
                activeSection === section.id
                  ? "bg-purple-50 text-purple-600 border-l-4 border-purple-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span className="text-xl">{section.icon}</span>
              <span className="font-medium">{section.title}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* 右侧内容 */}
      <div className="ml-64 flex-1 p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-4xl mx-auto"
          >
            {/* 标题 */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                <span className="text-3xl">{currentSection?.icon}</span>
                {currentSection?.title}
              </h2>
              <p className="text-gray-500 mt-1">共 {currentSection?.steps.length} 个步骤</p>
            </div>

            {/* 步骤导航 */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {currentSection?.steps.map((step, index) => (
                <button
                  key={index}
                  onClick={() => setActiveStep(index)}
                  className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition ${
                    activeStep === index
                      ? "bg-purple-600 text-white"
                      : "bg-white text-gray-600 border hover:bg-gray-50"
                  }`}
                >
                  步骤 {index + 1}
                </button>
              ))}
            </div>

            {/* 步骤内容 */}
            {currentSection?.steps[activeStep] && (
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden"
              >
                {/* 步骤标题 */}
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4">
                  <h3 className="text-lg font-bold text-white">
                    {currentSection.steps[activeStep].title}
                  </h3>
                </div>

                {/* 示意图 */}
                <div className="p-6 bg-gray-50 border-b">
                  <ScreenMock type={currentSection.steps[activeStep].image || ""} />
                </div>

                {/* 说明文字 */}
                <div className="p-6">
                  <p className="text-gray-600 leading-relaxed">
                    {currentSection.steps[activeStep].content}
                  </p>
                </div>

                {/* 操作提示 */}
                <div className="px-6 pb-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                    <span className="text-2xl">💡</span>
                    <div>
                      <div className="font-medium text-blue-800">小提示</div>
                      <div className="text-sm text-blue-600 mt-1">
                        {activeSection === "create" && activeStep === 3 && "图片建议使用正方形，显示效果更佳。超过100KB的图片建议使用在线图床获取URL。"}
                        {activeSection === "create" && activeStep === 4 && "多选模式下，用户最多只能投设定的票数。例如设置最大3项，用户只能选择3个选项。"}
                        {activeSection === "vote" && activeStep === 2 && "已选择的选项会有紫色边框高亮显示，点击已选选项可取消选择。"}
                        {activeSection === "screen" && activeStep === 1 && "按F11进入全屏后，按Esc可退出全屏模式。"}
                        {activeSection === "admin" && activeStep === 0 && "Token在.env文件的ADMIN_TOKEN变量中配置，建议使用复杂密码。"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 步骤导航 */}
                <div className="px-6 pb-6 flex justify-between">
                  <button
                    onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                    disabled={activeStep === 0}
                    className="px-4 py-2 rounded-lg text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100"
                  >
                    ← 上一步
                  </button>
                  <div className="text-sm text-gray-400">
                    {activeStep + 1} / {currentSection.steps.length}
                  </div>
                  <button
                    onClick={() => setActiveStep(Math.min(currentSection.steps.length - 1, activeStep + 1))}
                    disabled={activeStep === currentSection.steps.length - 1}
                    className="px-4 py-2 rounded-lg text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100"
                  >
                    下一步 →
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}