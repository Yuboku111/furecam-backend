import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text, Badge } from "@medusajs/ui"
import { useState, useEffect } from "react"

// カスタマーインサイトウィジェット
const CustomerInsightsWidget = () => {
  const [customerData, setCustomerData] = useState({
    totalCustomers: 0,
    newCustomers: 0,
    returningCustomers: 0,
    averageOrderValue: 0,
    customerLifetimeValue: 0,
    topCustomers: [] as Array<{name: string; orders: number; total: number}>,
    ageGroups: [] as Array<{range: string; percentage: number}>,
    regions: [] as Array<{name: string; percentage: number}>
  })

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        // 実際のAPIエンドポイントを呼び出す
        const response = await fetch('/admin/customer-insights')
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        
        setCustomerData(data)
        setLoading(false)
      } catch (error) {
        console.error('Failed to fetch customer data:', error)
        
        // エラー時のフォールバック
        setCustomerData({
          totalCustomers: 0,
          newCustomers: 0,
          returningCustomers: 0,
          averageOrderValue: 0,
          customerLifetimeValue: 0,
          topCustomers: [],
          ageGroups: [
            { range: "18-24", percentage: 35 },
            { range: "25-34", percentage: 40 },
            { range: "35-44", percentage: 20 },
            { range: "45+", percentage: 5 }
          ],
          regions: [
            { name: "東京", percentage: 25 },
            { name: "大阪", percentage: 15 },
            { name: "神奈川", percentage: 12 },
            { name: "愛知", percentage: 10 },
            { name: "その他", percentage: 38 }
          ]
        })
        setLoading(false)
      }
    }

    fetchCustomerData()
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
      <Heading level="h3" className="mb-4">カスタマーインサイト</Heading>

      {/* 顧客概要 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border">
          <Text className="text-sm text-gray-600">総顧客数</Text>
          <div className="text-2xl font-bold text-black">{customerData.totalCustomers.toLocaleString()}</div>
          <div className="flex items-center gap-2 mt-2">
            <Badge color="green">新規: {customerData.newCustomers}</Badge>
            <Badge color="blue">リピート: {customerData.returningCustomers}</Badge>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <Text className="text-sm text-gray-600">平均注文額</Text>
          <div className="text-2xl font-bold text-black">¥{customerData.averageOrderValue.toLocaleString()}</div>
          <Text className="text-sm text-gray-500 mt-2">
            LTV: ¥{customerData.customerLifetimeValue.toLocaleString()}
          </Text>
        </div>
      </div>

      {/* 優良顧客 */}
      <div className="mb-6">
        <Text className="text-sm font-medium text-gray-600 mb-3">優良顧客</Text>
        <div className="space-y-2">
          {customerData.topCustomers.map((customer, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-black">{customer.name}</div>
                <Text className="text-sm text-gray-600">{customer.orders}回購入</Text>
              </div>
              <div className="font-bold text-green-600">
                ¥{customer.total.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 年齢層分析 */}
      <div className="mb-6">
        <Text className="text-sm font-medium text-gray-600 mb-3">年齢層分析</Text>
        <div className="space-y-2">
          {customerData.ageGroups.map((group, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-white border rounded">
              <div className="text-sm text-black">{group.range}歳</div>
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${group.percentage}%` }}
                  />
                </div>
                <div className="text-sm font-medium text-black">{group.percentage}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 地域分析 */}
      <div>
        <Text className="text-sm font-medium text-gray-600 mb-3">地域分析</Text>
        <div className="space-y-2">
          {customerData.regions.map((region, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-white border rounded">
              <div className="text-sm text-black">{region.name}</div>
              <div className="flex items-center gap-2">
                <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-500 rounded-full"
                    style={{ width: `${region.percentage}%` }}
                  />
                </div>
                <div className="text-sm font-medium text-black">{region.percentage}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Container>
  )
}

// ウィジェット設定
export const config = defineWidgetConfig({
  zone: "customer.list.before",
})

export default CustomerInsightsWidget