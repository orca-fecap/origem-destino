"use client";

import { useEffect, useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { carregarDadosVeiculos, type DadosVeiculos } from "@/lib/data";
import { MetricsCards } from "./metrics-cards";
import { ChartSkeleton } from "./chart-skeleton";

const CORES = {
  nenhum:      "#cbd5e1",
  "1":         "#93c5fd",
  "2":         "#3b82f6",
  "3_ou_mais": "#1e40af",
};

interface Props {
  dadosExternos?: DadosVeiculos[];
  carregandoExterno?: boolean;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-background p-3 shadow-md text-sm">
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.fill }}>
          {p.name}: {Number(p.value).toLocaleString("pt-BR")}
        </p>
      ))}
    </div>
  );
}

export function SimpleBarChart({ dadosExternos, carregandoExterno }: Props) {
  const [dadosInternos, setDadosInternos] = useState<DadosVeiculos[]>([]);
  const [carregandoInterno, setCarregandoInterno] = useState(true);

  useEffect(() => {
    if (dadosExternos) return;
    carregarDadosVeiculos()
      .then(setDadosInternos)
      .catch(console.error)
      .finally(() => setCarregandoInterno(false));
  }, [dadosExternos]);

  const dados = dadosExternos ?? dadosInternos;
  const carregando = dadosExternos !== undefined
    ? (carregandoExterno ?? false)
    : carregandoInterno;

  const [distritoSelecionado, setDistritoSelecionado] = useState("todos");

  useEffect(() => {
      if (dadosExternos) return;
      carregarDadosVeiculos()
        .then(setDadosInternos)
        .catch(console.error)
        .finally(() => setCarregandoInterno(false));
    }, [dadosExternos]);

  const distritos = useMemo(() =>
    [...new Set(dados.map((d) => d.distrito))]
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b)),
    [dados]
  );

  const dadosFiltrados = useMemo(() => {
    const limpo = dados.filter((d) => d.distrito);
    return distritoSelecionado === "todos"
      ? limpo
      : limpo.filter((d) => d.distrito === distritoSelecionado);
  }, [dados, distritoSelecionado]);

  const totaisCidade = useMemo(() => {
    const soma = { nenhum: 0, "1": 0, "2": 0, "3_ou_mais": 0 };
    dados.filter((d) => d.distrito).forEach((d) => {
      soma.nenhum      += d.nenhum;
      soma["1"]        += d["1"];
      soma["2"]        += d["2"];
      soma["3_ou_mais"]+= d["3_ou_mais"];
    });
    return soma;
  }, [dados]);

  const dadosPizza = useMemo(() => [
    { name: "Nenhum",    value: totaisCidade.nenhum,      cor: CORES.nenhum },
    { name: "1 veículo", value: totaisCidade["1"],         cor: CORES["1"] },
    { name: "2 veículos",value: totaisCidade["2"],         cor: CORES["2"] },
    { name: "3 ou mais", value: totaisCidade["3_ou_mais"], cor: CORES["3_ou_mais"] },
  ], [totaisCidade]);

  if (carregando) return <ChartSkeleton />;

  // Empty state
  if (!dados.length) return (
    <div className="h-[400px] flex flex-col items-center justify-center text-muted-foreground gap-2">
      <p className="text-lg font-medium">Nenhum dado encontrado</p>
      <p className="text-sm">Verifique se o arquivo <code>public/data/df.csv</code> existe.</p>
    </div>
  );

  return (
    <div>
      <MetricsCards dados={dados.filter((d) => d.distrito)} />

      {/* Filtro */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm font-medium text-muted-foreground">Distrito:</span>
        <Select value={distritoSelecionado} onValueChange={setDistritoSelecionado}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Escolha um distrito" />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            <SelectItem value="todos">Todos os distritos</SelectItem>
            {distritos.map((d) => (
              <SelectItem key={d} value={d}>{d}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {distritoSelecionado !== "todos" && (
          <button
            onClick={() => setDistritoSelecionado("todos")}
            className="text-xs text-muted-foreground underline hover:text-foreground"
          >
            limpar
          </button>
        )}
      </div>

      {/* Charts */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dadosFiltrados} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="distrito" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={100} />
              <YAxis tickFormatter={(v) => v.toLocaleString("pt-BR")} tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="nenhum"     name="Nenhum"     fill={CORES.nenhum}      radius={[4,4,0,0]} />
              <Bar dataKey="1"          name="1 veículo"  fill={CORES["1"]}        radius={[4,4,0,0]} />
              <Bar dataKey="2"          name="2 veículos" fill={CORES["2"]}        radius={[4,4,0,0]} />
              <Bar dataKey="3_ou_mais"  name="3 ou mais"  fill={CORES["3_ou_mais"]}radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <Card className="w-full lg:w-80 shrink-0">
          <CardHeader>
            <CardTitle className="text-base">Cidade de São Paulo</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="w-full h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={dadosPizza} dataKey="value" nameKey="name"
                    cx="50%" cy="50%" outerRadius={80} innerRadius={40}
                    label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {dadosPizza.map((entry) => (
                      <Cell key={entry.name} fill={entry.cor} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => Number(v ?? 0).toLocaleString("pt-BR")} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Legenda manual (mais legível que a built-in) */}
            <div className="mt-3 w-full space-y-1">
              {dadosPizza.map((d) => (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-sm inline-block" style={{ background: d.cor }} />
                    <span>{d.name}</span>
                  </div>
                  <span className="text-muted-foreground">{d.value.toLocaleString("pt-BR")}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Total de domicílios por posse</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}