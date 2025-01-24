a o netlify import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ServiceEntry } from "@/components/ServiceEntry";
import { useAuth } from "@/hooks/use-auth";
import { getServices } from "@/integrations/firebase/firebase-db";
import { ServiceType } from "@/integrations/firebase/types";

const BarberDashboard = () => {
  const { user } = useAuth();
  const [services, setServices] = useState<ServiceType[]>([]);
  const [dailyEarnings, setDailyEarnings] = useState(0);
  const [weeklyEarnings, setWeeklyEarnings] = useState(0);
  const [dailyServices, setDailyServices] = useState(0);

  useEffect(() => {
    const fetchServices = async () => {
      if (user) {
        const servicesFromFirebase = await getServices();
        if (servicesFromFirebase) {
          // Filter services for the current user (assuming services have a barberId field)
          const userServices = servicesFromFirebase.filter(
            (service) => service.barberId === user.uid
          );
          setServices(userServices);
          calculateEarnings(userServices);
        } else {
          setDailyEarnings(0);
          setWeeklyEarnings(0);
          setDailyServices(0);
        }
      }
    };
    fetchServices();
  }, [user]);

 const calculateEarnings = (services: ServiceType[]) => {
    const today = new Date();
    const startOfWeek = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - today.getDay()
    );
    let dailyEarnings = 0;
    let weeklyEarnings = 0;
    let dailyServices = 0;

    if (services && services.length > 0) {
      services.forEach((service) => {
        const serviceDate = new Date(service.timestamp);
        if (
          serviceDate.getDate() === today.getDate() &&
          serviceDate.getMonth() === today.getMonth() &&
          serviceDate.getFullYear() === today.getFullYear()
        ) {
          dailyEarnings += service.price;
          dailyServices++;
        }
        if (serviceDate >= startOfWeek && serviceDate <= today) {
          weeklyEarnings += service.price;
        }
      });
    } else {
      setDailyEarnings(0);
      setWeeklyEarnings(0);
      setDailyServices(0);
    }

    setDailyEarnings(dailyEarnings);
    setWeeklyEarnings(weeklyEarnings);
    setDailyServices(dailyServices);
  };

  const handleServiceComplete = async (service: any) => {
    console.log("Service completed:", service);
    if (user) {
      const servicesFromFirebase = await getServices();
        if (servicesFromFirebase) {
          // Filter services for the current user (assuming services have a barberId field)
          const userServices = servicesFromFirebase.filter(
            (service) => service.barberId === user.uid
          );
          setServices(userServices);
          calculateEarnings(userServices);
        }
    }
  };

  const mockData = [];

  const mockServices = [];

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary">
              Dashboard do Barbeiro
            </h1>
            <p className="text-muted-foreground">
              Bem-vindo de volta, {user?.email}
            </p>
          </div>
          <Button variant="outline">Atualizar Dados</Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <ServiceEntry onServiceComplete={handleServiceComplete} />
          </div>

          <div className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-medium">Ganhos Hoje</h3>
                <p className="text-3xl font-bold mt-2">€{dailyEarnings.toFixed(2) || "0,00"}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Comissão: €{(dailyEarnings * 0.2).toFixed(2) || "0,00"}
                </p>
              </Card>
              <Card className="p-6">
                <h3 className="text-lg font-medium">Ganhos esta Semana</h3>
                <p className="text-3xl font-bold mt-2">€{weeklyEarnings.toFixed(2) || "0,00"}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Comissão: €{(weeklyEarnings * 0.2).toFixed(2) || "0,00"}
                </p>
              </Card>
              <Card className="p-6">
                <h3 className="text-lg font-medium">Serviços Hoje</h3>
                <p className="text-3xl font-bold mt-2">{dailyServices || "0"}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  +2 agendados
                </p>
              </Card>
            </div>

            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Desempenho Semanal</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#1a2b4b" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Últimos Serviços</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Serviço</th>
                      <th className="text-right py-3 px-4">Valor</th>
                      <th className="text-right py-3 px-4">Comissão</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockServices.map((service) => (
                      <tr key={service.id} className="border-b">
                        <td className="py-3 px-4">{service.service}</td>
                        <td className="text-right py-3 px-4">€{service.value}</td>
                        <td className="text-right py-3 px-4">
                          €{service.commission}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarberDashboard;
