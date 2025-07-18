import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Button, Table, Badge, Text } from "@medusajs/ui"
import { useState, useEffect } from "react"
import { ArrowUpRightMini, EllipsisHorizontal } from "@medusajs/icons"

// FureCamダッシュボード
const FureCamDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    todayOrders: 0,
    todayRevenue: 0,
    conversionRate: 0,
    topProducts: [] as Array<{name: string; sales: number; revenue: number}>,
    recentOrders: [] as Array<{id: string; customer: string; amount: number; status: string; time: string}>,
    visitorStats: {
      totalVisitors: 0,
      uniqueVisitors: 0,
      pageViews: 0,
      bounceRate: 0
    }
  })

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 実際のAPIからデータを取得する処理
    const fetchDashboardData = async () => {
      try {
        // 実際のAPIエンドポイントを呼び出す
        const response = await fetch('/admin/furecam-analytics')
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        
        setDashboardData(data)
        setLoading(false)
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
        
        // エラー時のフォールバック（空のデータ）
        setDashboardData({
          totalOrders: 0,
          totalRevenue: 0,
          todayOrders: 0,
          todayRevenue: 0,
          conversionRate: 0,
          topProducts: [],
          recentOrders: [],
          visitorStats: {
            totalVisitors: 0,
            uniqueVisitors: 0,
            pageViews: 0,
            bounceRate: 0
          }
        })
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <Container className="p-8">
        <div className="flex items-center justify-center h-64">
          <Text>読み込み中...</Text>
        </div>
      </Container>
    )
  }

  return (
    <Container className="p-8">
      <div className="flex items-center justify-between mb-8">
        <Heading level="h1" className="text-black">FureCam トラッキングダッシュボード</Heading>
        <Button variant="secondary" size="small">
          <ArrowUpRightMini />
          サイトを開く
        </Button>
      </div>

      {/* 主要メトリクス */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border">
          <Text className="text-sm text-gray-600 mb-2">総注文数</Text>
          <div className="text-2xl font-bold text-black">
            {dashboardData.totalOrders.toLocaleString()}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border">
          <Text className="text-sm text-gray-600 mb-2">総売上</Text>
          <div className="text-2xl font-bold text-black">
            ¥{dashboardData.totalRevenue.toLocaleString()}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border">
          <Text className="text-sm text-gray-600 mb-2">今日の注文数</Text>
          <div className="text-2xl font-bold text-green-600">
            {dashboardData.todayOrders}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border">
          <Text className="text-sm text-gray-600 mb-2">コンバージョン率</Text>
          <div className="text-2xl font-bold text-blue-600">
            {dashboardData.conversionRate}%
          </div>
        </div>
      </div>

      {/* ウェブサイト統計 */}
      <div className="bg-white p-6 rounded-lg border mb-8">
        <Heading level="h3" className="mb-4">ウェブサイト統計</Heading>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Text className="text-sm text-gray-600">総訪問者数</Text>
            <div className="text-xl font-semibold text-black">{dashboardData.visitorStats.totalVisitors.toLocaleString()}</div>
          </div>
          <div>
            <Text className="text-sm text-gray-600">ユニーク訪問者数</Text>
            <div className="text-xl font-semibold text-black">{dashboardData.visitorStats.uniqueVisitors.toLocaleString()}</div>
          </div>
          <div>
            <Text className="text-sm text-gray-600">ページビュー</Text>
            <div className="text-xl font-semibold text-black">{dashboardData.visitorStats.pageViews.toLocaleString()}</div>
          </div>
          <div>
            <Text className="text-sm text-gray-600">直帰率</Text>
            <div className="text-xl font-semibold text-black">{dashboardData.visitorStats.bounceRate}%</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 人気商品 */}
        <div className="bg-white p-6 rounded-lg border">
          <Heading level="h3" className="mb-4">人気商品</Heading>
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>商品名</Table.HeaderCell>
                <Table.HeaderCell>販売数</Table.HeaderCell>
                <Table.HeaderCell>売上</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {dashboardData.topProducts.map((product, index) => (
                <Table.Row key={index}>
                  <Table.Cell>{product.name}</Table.Cell>
                  <Table.Cell>{product.sales}</Table.Cell>
                  <Table.Cell>¥{product.revenue.toLocaleString()}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>

        {/* 最近の注文 */}
        <div className="bg-white p-6 rounded-lg border">
          <Heading level="h3" className="mb-4">最近の注文</Heading>
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>注文ID</Table.HeaderCell>
                <Table.HeaderCell>顧客</Table.HeaderCell>
                <Table.HeaderCell>金額</Table.HeaderCell>
                <Table.HeaderCell>ステータス</Table.HeaderCell>
                <Table.HeaderCell>時間</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {dashboardData.recentOrders.map((order) => (
                <Table.Row key={order.id}>
                  <Table.Cell>{order.id}</Table.Cell>
                  <Table.Cell>{order.customer}</Table.Cell>
                  <Table.Cell>¥{order.amount.toLocaleString()}</Table.Cell>
                  <Table.Cell>
                    <Badge color={order.status === "完了" ? "green" : "orange"}>
                      {order.status}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>{order.time}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>
      </div>
    </Container>
  )
}

// ルート設定
export const config = defineRouteConfig({
  label: "FureCam ダッシュボード",
  icon: EllipsisHorizontal,
})

export default FureCamDashboard