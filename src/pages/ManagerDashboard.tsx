import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AddProductModal } from "@/components/AddProductModal";
import { ReportPDF } from "@/components/ReportPDF";
import { pdf } from "@react-pdf/renderer";
import { toast } from "@/hooks/use-toast";
import { getProducts, getBarbers } from "@/integrations/firebase/firebase-db";
import { Product, Barber } from "@/integrations/firebase/types";

const ManagerDashboard = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const productsFromFirebase = await getProducts();
      if (productsFromFirebase) {
        setProducts(productsFromFirebase);
      }
    };
    fetchProducts();

    const fetchBarbers = async () => {
      const barbersFromFirebase = await getBarbers();
      if (barbersFromFirebase) {
        setBarbers(barbersFromFirebase);
      }
    };
    fetchBarbers();
  }, []);

  const totalBalance = barbers.reduce((sum, barber) => sum + barber.balance, 0);

  const handleAddProduct = (newProduct: {
    name: string;
    price: number;
    stock: number;
    description?: string;
  }) => {
    const productToAdd = {
      id: products.length + 1,
      ...newProduct,
    };
    setProducts([...products, productToAdd]);
  };

  const handleExportReport = async () => {
    try {
      const blob = await pdf(
        <ReportPDF
          products={products}
          barbers={barbers}
        />
      ).toBlob();
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `relatorio-barbearia-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Relatório exportado",
        description: "O relatório foi gerado com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro ao gerar o relatório.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary">Dashboard do Gerente</h1>
            <p className="text-muted-foreground">Gestão e Controle</p>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" onClick={handleExportReport}>
              Exportar Relatório
            </Button>
            <AddProductModal onProductAdd={handleAddProduct} />
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-medium">Faturamento Hoje</h3>
            <p className="text-3xl font-bold mt-2">€850,00</p>
            <p className="text-sm text-muted-foreground mt-1">+15% vs. ontem</p>
          </Card>
          <Card className="p-6">
            <h3 className="text-lg font-medium">Produtos em Estoque</h3>
            <p className="text-3xl font-bold mt-2">{products.reduce((sum, p) => sum + p.stock, 0)}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {products.filter(p => p.stock < 10).length} precisam reposição
            </p>
          </Card>
          <Card className="p-6">
            <h3 className="text-lg font-medium">Barbeiros Ativos</h3>
            <p className="text-3xl font-bold mt-2">{barbers.length}</p>
            <p className="text-sm text-muted-foreground mt-1">2 em serviço agora</p>
          </Card>
          <Card className="p-6">
            <h3 className="text-lg font-medium">Total a Pagar</h3>
            <p className="text-3xl font-bold mt-2">€{totalBalance.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground mt-1">Comissões pendentes</p>
          </Card>
        </div>

        <Tabs defaultValue="products" className="w-full">
          <TabsList>
            <TabsTrigger value="products">Produtos</TabsTrigger>
            <TabsTrigger value="barbers">Barbeiros</TabsTrigger>
          </TabsList>
          
          <TabsContent value="products">
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead className="text-right">Estoque</TableHead>
                    <TableHead className="text-right">Preço</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>{product.name}</TableCell>
                      <TableCell className="text-right">{product.stock}</TableCell>
                      <TableCell className="text-right">€{product.basePrice}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">Editar</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
          
          <TabsContent value="barbers">
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Barbeiro</TableHead>
                    <TableHead className="text-right">Serviços</TableHead>
                    <TableHead className="text-right">Avaliação</TableHead>
                    <TableHead className="text-right">Saldo a Pagar</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {barbers.map((barber) => (
                    <TableRow key={barber.id}>
                      <TableCell>{barber.name}</TableCell>
                      <TableCell className="text-right">{barber.services}</TableCell>
                      <TableCell className="text-right">{barber.rating}</TableCell>
                      <TableCell className="text-right">€{barber.balance.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">Detalhes</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ManagerDashboard;
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AddProductModal } from "@/components/AddProductModal";
import { ReportPDF } from "@/components/ReportPDF";
import { pdf } from "@react-pdf/renderer";
import { toast } from "@/hooks/use-toast";

const initialProducts = [
  { id: 1, name: "Pomada Modeladora", stock: 15, price: 25 },
  { id: 2, name: "Óleo para Barba", stock: 8, price: 30 },
  { id: 3, name: "Shampoo Especial", stock: 12, price: 20 },
];

const mockBarbers = [
  { id: 1, name: "João Silva", services: 145, rating: 4.8, balance: 580.50 },
  { id: 2, name: "Miguel Santos", services: 132, rating: 4.7, balance: 425.75 },
  { id: 3, name: "Pedro Costa", services: 128, rating: 4.9, balance: 495.20 },
];

const ManagerDashboard = () => {
  const [products, setProducts] = useState(initialProducts);
  const totalBalance = mockBarbers.reduce((sum, barber) => sum + barber.balance, 0);

  const handleAddProduct = (newProduct: {
    name: string;
    price: number;
    stock: number;
    description?: string;
  }) => {
    const productToAdd = {
      id: products.length + 1,
      ...newProduct,
    };
    setProducts([...products, productToAdd]);
  };

  const handleExportReport = async () => {
    try {
      const blob = await pdf(
        <ReportPDF
          products={products}
          barbers={mockBarbers}
        />
      ).toBlob();
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `relatorio-barbearia-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Relatório exportado",
        description: "O relatório foi gerado com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro ao gerar o relatório.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary">Dashboard do Gerente</h1>
            <p className="text-muted-foreground">Gestão e Controle</p>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" onClick={handleExportReport}>
              Exportar Relatório
            </Button>
            <AddProductModal onProductAdd={handleAddProduct} />
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-medium">Faturamento Hoje</h3>
            <p className="text-3xl font-bold mt-2">€850,00</p>
            <p className="text-sm text-muted-foreground mt-1">+15% vs. ontem</p>
          </Card>
          <Card className="p-6">
            <h3 className="text-lg font-medium">Produtos em Estoque</h3>
            <p className="text-3xl font-bold mt-2">{products.reduce((sum, p) => sum + p.stock, 0)}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {products.filter(p => p.stock < 10).length} precisam reposição
            </p>
          </Card>
          <Card className="p-6">
            <h3 className="text-lg font-medium">Barbeiros Ativos</h3>
            <p className="text-3xl font-bold mt-2">{mockBarbers.length}</p>
            <p className="text-sm text-muted-foreground mt-1">2 em serviço agora</p>
          </Card>
          <Card className="p-6">
            <h3 className="text-lg font-medium">Total a Pagar</h3>
            <p className="text-3xl font-bold mt-2">€{totalBalance.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground mt-1">Comissões pendentes</p>
          </Card>
        </div>

        <Tabs defaultValue="products" className="w-full">
          <TabsList>
            <TabsTrigger value="products">Produtos</TabsTrigger>
            <TabsTrigger value="barbers">Barbeiros</TabsTrigger>
          </TabsList>
          
          <TabsContent value="products">
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead className="text-right">Estoque</TableHead>
                    <TableHead className="text-right">Preço</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>{product.name}</TableCell>
                      <TableCell className="text-right">{product.stock}</TableCell>
                      <TableCell className="text-right">€{product.price}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">Editar</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
          
          <TabsContent value="barbers">
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Barbeiro</TableHead>
                    <TableHead className="text-right">Serviços</TableHead>
                    <TableHead className="text-right">Avaliação</TableHead>
                    <TableHead className="text-right">Saldo a Pagar</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockBarbers.map((barber) => (
                    <TableRow key={barber.id}>
                      <TableCell>{barber.name}</TableCell>
                      <TableCell className="text-right">{barber.services}</TableCell>
                      <TableCell className="text-right">{barber.rating}</TableCell>
                      <TableCell className="text-right">€{barber.balance.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">Detalhes</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ManagerDashboard;
