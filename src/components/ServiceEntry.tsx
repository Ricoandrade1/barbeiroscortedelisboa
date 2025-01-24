import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const serviceTypes = [
  { id: "haircut", name: "Corte Masculino", basePrice: 35 },
  { id: "beard", name: "Barba", basePrice: 25 },
  { id: "combo", name: "Corte + Barba", basePrice: 55 },
  { id: "hair-design", name: "Design Cabelo", basePrice: 45 },
  { id: "beard-design", name: "Design Barba", basePrice: 35 },
]

const extraServiceTypes = [
  { id: "eyebrows", name: "Tratamento de Sobrancelhas", basePrice: 15 },
  { id: "design-art", name: "Design Artístico", basePrice: 25 },
  { id: "hair-treatment", name: "Tratamento Capilar", basePrice: 30 },
  { id: "color", name: "Coloração", basePrice: 40 },
]

const products = [
  { id: "1", name: "Shampoo Premium", basePrice: 20, stock: 15 },
  { id: "2", name: "Pomada Modeladora", basePrice: 15, stock: 25 },
  { id: "3", name: "Óleo para Barba", basePrice: 18, stock: 20 },
]

interface ServiceEntryProps {
  onServiceComplete?: (service: any) => void
}

const VAT_RATE = 0.23 // 23% VAT
const COMMISSION_RATE = 0.20 // 20% commission

export function ServiceEntry({ onServiceComplete }: ServiceEntryProps) {
  const [selectedService, setSelectedService] = useState("")
  const [clientName, setClientName] = useState("")
  const [extraService, setExtraService] = useState("")
  const [selectedProduct, setSelectedProduct] = useState("")
  const [quantity, setQuantity] = useState("1")

  const calculateProductPrices = (basePrice: number) => {
    const vatAmount = basePrice * VAT_RATE
    const totalPrice = basePrice + vatAmount
    const commission = basePrice * COMMISSION_RATE
    return { vatAmount, totalPrice, commission }
  }

  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedService || !clientName) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Por favor preencha todos os campos obrigatórios.",
      })
      return
    }

    const serviceDetails = {
      type: selectedService,
      clientName,
      extraService,
      timestamp: new Date().toISOString(),
      price: serviceTypes.find(s => s.id === selectedService)?.basePrice || 0,
    }

    try {
      console.log("Service recorded:", serviceDetails)
      
      toast({
        title: "Serviço registrado com sucesso!",
        description: `${serviceTypes.find(s => s.id === selectedService)?.name} para ${clientName}`,
      })

      setSelectedService("")
      setClientName("")
      setExtraService("")

      if (onServiceComplete) {
        onServiceComplete(serviceDetails)
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao registrar serviço",
        description: "Por favor tente novamente.",
      })
    }
  }

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedProduct || !quantity) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Por favor selecione um produto e quantidade.",
      })
      return
    }

    const product = products.find(p => p.id === selectedProduct)
    if (!product) return

    const { vatAmount, totalPrice, commission } = calculateProductPrices(product.basePrice)
    const productSale = {
      productId: selectedProduct,
      productName: product.name,
      quantity: Number(quantity),
      basePrice: product.basePrice,
      vatAmount,
      totalPrice,
      commission,
      timestamp: new Date().toISOString(),
    }

    try {
      console.log("Product sale recorded:", productSale)
      
      toast({
        title: "Venda registrada com sucesso!",
        description: `${product.name} x${quantity}`,
      })

      setSelectedProduct("")
      setQuantity("1")
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao registrar venda",
        description: "Por favor tente novamente.",
      })
    }
  }

  return (
    <Tabs defaultValue="services" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="services">Serviços</TabsTrigger>
        <TabsTrigger value="products">Produtos</TabsTrigger>
      </TabsList>

      <TabsContent value="services">
        <Card className="p-6">
          <form onSubmit={handleServiceSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="service-type">Tipo de Serviço</Label>
              <Select value={selectedService} onValueChange={setSelectedService}>
                <SelectTrigger id="service-type">
                  <SelectValue placeholder="Selecione o serviço" />
                </SelectTrigger>
                <SelectContent>
                  {serviceTypes.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name} - €{service.basePrice}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="client-name">Nome do Cliente</Label>
              <Input
                id="client-name"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Nome do cliente"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="extra-service">Serviço Extra</Label>
              <Select value={extraService} onValueChange={setExtraService}>
                <SelectTrigger id="extra-service">
                  <SelectValue placeholder="Selecione o serviço extra (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  {extraServiceTypes.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name} - €{service.basePrice}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full">
              Registrar Serviço
            </Button>
          </form>
        </Card>
      </TabsContent>

      <TabsContent value="products">
        <Card className="p-6">
          <form onSubmit={handleProductSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="product-type">Produto</Label>
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger id="product-type">
                  <SelectValue placeholder="Selecione o produto" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => {
                    const { totalPrice, commission } = calculateProductPrices(product.basePrice)
                    return (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} - €{totalPrice.toFixed(2)} (Comissão: €{commission.toFixed(2)})
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantidade</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="1"
              />
            </div>

            {selectedProduct && (
              <div className="space-y-2 bg-muted p-4 rounded-md">
                <h3 className="font-medium">Detalhes do Produto</h3>
                {(() => {
                  const product = products.find(p => p.id === selectedProduct)
                  if (!product) return null
                  
                  const { vatAmount, totalPrice, commission } = calculateProductPrices(product.basePrice)
                  return (
                    <div className="space-y-1 text-sm">
                      <p>Preço base: €{product.basePrice.toFixed(2)}</p>
                      <p>IVA (23%): €{vatAmount.toFixed(2)}</p>
                      <p>Preço total: €{totalPrice.toFixed(2)}</p>
                      <p>Comissão (20%): €{commission.toFixed(2)}</p>
                      <p>Stock disponível: {product.stock}</p>
                    </div>
                  )
                })()}
              </div>
            )}

            <Button type="submit" className="w-full">
              Registrar Venda
            </Button>
          </form>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
