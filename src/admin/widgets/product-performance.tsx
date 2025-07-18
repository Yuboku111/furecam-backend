import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text, Badge } from "@medusajs/ui"
import { useState, useEffect } from "react"

// 商品パフォーマンスウィジェット
const ProductPerformanceWidget = () => {
  const [productData, setProductData] = useState({
    topPerformers: [] as Array<{name: string; sales: number; revenue: number; growth: number}>,
    inventoryAlerts: [] as Array<{name: string; stock: number; status: string}>,
    conversionRates: [] as Array<{product: string; rate: number; views: number}>
  })

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        // 実際のAPIエンドポイントを呼び出す
        const response = await fetch('/admin/product-performance')
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        
        setProductData(data)
        setLoading(false)
      } catch (error) {
        console.error('Failed to fetch product data:', error)
        
        // エラー時のフォールバック
        setProductData({
          topPerformers: [],
          inventoryAlerts: [],
          conversionRates: []
        })
        setLoading(false)
      }
    }

    fetchProductData()
  }, [])

  if (loading) {
    return (
      <Container className="p-4">
        <Text>読み込み中...</Text>
      </Container>
    )
  }

  const getStockBadgeVariant = (status: string) => {
    switch (status) {
      case "low": return "red"
      case "medium": return "orange"
      default: return "green"
    }
  }

  return (
    <Container className="p-4">
      <Heading level="h3" className="mb-4">商品パフォーマンス</Heading>

      {/* トップパフォーマー */}
      <div className="mb-6">
        <Text className="text-sm font-medium text-gray-600 mb-3">売上トップ3</Text>
        <div className="space-y-3">
          {productData.topPerformers.map((product, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <Text className="font-medium">{product.name}</Text>
                <Text className="text-sm text-gray-600">
                  {product.sales}個販売 • ¥{product.revenue.toLocaleString()}
                </Text>
              </div>
              <Badge color="green">+{product.growth}%</Badge>
            </div>
          ))}
        </div>
      </div>

      {/* 在庫アラート */}
      <div className="mb-6">
        <Text className="text-sm font-medium text-gray-600 mb-3">在庫アラート</Text>
        <div className="space-y-2">
          {productData.inventoryAlerts.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-white border rounded-lg">
              <div>
                <Text className="font-medium">{item.name}</Text>
                <Text className="text-sm text-gray-600">残り{item.stock}個</Text>
              </div>
              <Badge color={getStockBadgeVariant(item.status)}>
                {item.status === "low" ? "在庫少" : "要補充"}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      {/* コンバージョン率 */}
      <div>
        <Text className="text-sm font-medium text-gray-600 mb-3">コンバージョン率</Text>
        <div className="space-y-3">
          {productData.conversionRates.map((product, index) => (
            <div key={index} className="p-3 bg-white border rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <Text className="font-medium">{product.product}</Text>
                <Text className="text-sm font-bold text-blue-600">{product.rate}%</Text>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${(product.rate / 10) * 100}%` }}
                ></div>
              </div>
              <Text className="text-xs text-gray-500">{product.views.toLocaleString()} 回表示</Text>
            </div>
          ))}
        </div>
      </div>
    </Container>
  )
}

// ウィジェット設定
export const config = defineWidgetConfig({
  zone: "product.list.before",
})

export default ProductPerformanceWidget