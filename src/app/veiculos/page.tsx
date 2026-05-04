"use client";

import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SimpleBarChart } from "@/components/veiculos/simple-bar-chart";
import { PercentBarChart } from "@/components/veiculos/percent-bar-chart";
import { carregarDadosVeiculos, type DadosVeiculos } from "@/lib/data";

export default function VeiculosPage() {
  const [dados, setDados] = useState<DadosVeiculos[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarDadosVeiculos()
      .then(setDados)
      .catch(console.error)
      .finally(() => setCarregando(false));
  }, []);

  return (
    <main className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Posse de Veículos</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Distribuição por domicílio nos distritos de São Paulo
        </p>
      </div>
      <Separator className="mb-6" />

      <Tabs defaultValue="absoluto">
        <TabsList className="mb-6">
          <TabsTrigger value="absoluto">Valores absolutos</TabsTrigger>
          <TabsTrigger value="percentual">Participação %</TabsTrigger>
        </TabsList>

        <TabsContent value="absoluto">
          <SimpleBarChart dadosExternos={dados} carregandoExterno={carregando} />
        </TabsContent>

        <TabsContent value="percentual">
          {carregando ? (
            <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">
              Carregando dados...
            </div>
          ) : (
            <PercentBarChart dados={dados} />
          )}
        </TabsContent>
      </Tabs>
    </main>
  );
}