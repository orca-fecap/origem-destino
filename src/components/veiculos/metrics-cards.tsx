"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DadosVeiculos } from "@/lib/data";
import { Car, Bike, Users, BarChart3 } from "lucide-react";

interface Props {
  dados: DadosVeiculos[];
}

export function MetricsCards({ dados }: Props) {
  const total = dados.reduce((acc, d) => acc + (d.total ?? 0), 0);
  const semVeiculo = dados.reduce((acc, d) => acc + (d.nenhum ?? 0), 0);
  const umVeiculo = dados.reduce((acc, d) => acc + (d["1"] ?? 0), 0);
  const tresOuMais = dados.reduce((acc, d) => acc + (d["3_ou_mais"] ?? 0), 0);

  const fmt = (n: number) => n.toLocaleString("pt-BR");
  const pct = (n: number) => total > 0 ? `${((n / total) * 100).toFixed(1)}%` : "—";

  const cards = [
    {
      title: "Total de domicílios",
      value: fmt(total),
      sub: "cidade de São Paulo",
      icon: Users,
      color: "text-slate-600",
      bg: "bg-slate-100",
    },
    {
      title: "Sem veículo",
      value: fmt(semVeiculo),
      sub: pct(semVeiculo),
      icon: Bike,
      color: "text-rose-600",
      bg: "bg-rose-50",
    },
    {
      title: "1 veículo",
      value: fmt(umVeiculo),
      sub: pct(umVeiculo),
      icon: Car,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "3 ou mais veículos",
      value: fmt(tresOuMais),
      sub: pct(tresOuMais),
      icon: BarChart3,
      color: "text-indigo-700",
      bg: "bg-indigo-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((c) => (
        <Card key={c.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {c.title}
            </CardTitle>
            <div className={`p-2 rounded-md ${c.bg}`}>
              <c.icon className={`h-4 w-4 ${c.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{c.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{c.sub}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}