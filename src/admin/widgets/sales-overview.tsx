import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text, Badge } from "@medusajs/ui"
import { useState, useEffect } from "react"

// 売上概要ウィジェット
const SalesOverviewWidget = () => {
  const [salesData, setSalesData] = useState({
    dailySales: 0,
    weeklySales: 0,
    monthlySales: 0,
    growthRate: 0,
    totalCustomers: 0,
    newCustomers: 0
  })

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        // 実際のAPIエンドポイントを呼び出す
        const response = await fetch('/admin/sales-overview')
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        
        setSalesData(data)
        setLoading(false)
      } catch (error) {
        console.error('Failed to fetch sales data:', error)
        
        // エラー時のフォールバック
        setSalesData({
          dailySales: 0,
          weeklySales: 0,
          monthlySales: 0,
          growthRate: 0,
          totalCustomers: 0,
          newCustomers: 0
        })
        setLoading(false)
      }
    }

    fetchSalesData()
  }, [])

  if (loading) {
    return (
      <Container className="p-4">
        <Text>読み込み中...</Text>
      </Container>
    )
  }

  return (
    <Container className="p-4">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-lg mb-4">
        <Heading level="h3" className="text-white mb-2">FureCam 売上概要</Heading>
        <div className="text-white">リアルタイム売上データ</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <Text className="text-sm text-gray-600">今日の売上</Text>
          <div className="text-xl font-bold text-green-600">¥{salesData.dailySales.toLocaleString()}</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <Text className="text-sm text-gray-600">今週の売上</Text>
          <div className="text-xl font-bold text-black">¥{salesData.weeklySales.toLocaleString()}</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <Text className="text-sm text-gray-600">今月の売上</Text>
          <div className="text-xl font-bold text-black">¥{salesData.monthlySales.toLocaleString()}</div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <Text className="text-sm text-gray-600">成長率</Text>
            <Badge color="green">+{salesData.growthRate}%</Badge>
          </div>
          <div className="text-lg font-semibold text-black">前月比</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <Text className="text-sm text-gray-600">新規顧客</Text>
          <div className="text-lg font-semibold text-black">{salesData.newCustomers}名</div>
          <Text className="text-xs text-gray-500">総顧客数: {salesData.totalCustomers}名</Text>
        </div>
      </div>
    </Container>
  )
}

// ウィジェット設定
export const config = defineWidgetConfig({
  zone: "order.list.before",
})

export default SalesOverviewWidget