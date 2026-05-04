"use client";

import { useMemo, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { DadosVeiculos } from "@/lib/data";

const CORES = {
  nenhum:      "#cbd5e1",
  "1":         "#93c5fd",
  "2":         "#3b82f6",
  "3_ou_mais": "#1e40af",
};

const CATEGORIAS = [
  { key: "nenhum",     label: "Nenhum",     cor: CORES.nenhum },
  { key: "1",          label: "1 veículo",  cor: CORES["1"] },
  { key: "2",          label: "2 veículos", cor: CORES["2"] },
  { key: "3_ou_mais",  label: "3 ou mais",  cor: CORES["3_ou_mais"] },
] as const;

type CategoriaKey = typeof CATEGORIAS[number]["key"];

interface Props {
  dados: DadosVeiculos[];
}

// Tooltip customizado
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-background p-3 shadow-md text-sm min-w-[180px]">
      <p className="font-semibold mb-2">{label}</p>
      {[...payload].reverse().map((p: any) => (
        <div key={p.dataKey} className="flex justify-between gap-4">
          <span style={{ color: p.fill }}>{p.name}</span>
          <span className="font-medium">{Number(p.value).toFixed(1)}%</span>
        </div>
      ))}
    </div>
  );
}

export function PercentBarChart({ dados }: Props) {
  const [ordenarPor, setOrdenarPor] = useState<CategoriaKey>("nenhum");
  const [destaque, setDestaque] = useState<CategoriaKey | null>(null);

  // Calcula percentuais por distrito
  const dadosPercent = useMemo(() => {
    return dados
      .filter((d) => d.distrito && d.total > 0)
      .map((d) => {
        const t = d.total;
        return {
          distrito:    d.distrito,
          nenhum:      (d.nenhum      / t) * 100,
          "1":         (d["1"]        / t) * 100,
          "2":         (d["2"]        / t) * 100,
          "3_ou_mais": (d["3_ou_mais"]/ t) * 100,
          total:       d.total,
        };
      })
      .sort((a, b) => b[ordenarPor] - a[ordenarPor]);
  }, [dados, ordenarPor]);

  // Highlight: opacidade reduzida para categorias não em destaque
  const opacity = (key: CategoriaKey) =>
    destaque === null || destaque === key ? 1 : 0.25;

  return (
    <div>
      {/* Controles */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Ordenar por:</span>
          <Select value={ordenarPor} onValueChange={(v) => setOrdenarPor(v as CategoriaKey)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIAS.map((c) => (
                <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Legenda interativa — clique para destacar */}
        <div className="flex flex-wrap gap-2 ml-auto">
          {CATEGORIAS.map((c) => (
            <Badge
              key={c.key}
              variant="outline"
              className="cursor-pointer select-none transition-opacity"
              style={{
                borderColor: c.cor,
                color: destaque === c.key ? "white" : c.cor,
                backgroundColor: destaque === c.key ? c.cor : "transparent",
                opacity: destaque === null || destaque === c.key ? 1 : 0.4,
              }}
              onClick={() => setDestaque(destaque === c.key ? null : c.key)}
            >
              {c.label}
            </Badge>
          ))}
        </div>
      </div>

      {/* Gráfico */}
      <div className="w-full" style={{ height: Math.max(400, dadosPercent.length * 28) }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={dadosPercent}
            layout="vertical"
            margin={{ top: 0, right: 40, left: 110, bottom: 0 }}
            barSize={16}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
            <XAxis
              type="number"
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
              tick={{ fontSize: 11 }}
              tickCount={6}
            />
            <YAxis
              type="category"
              dataKey="distrito"
              tick={{ fontSize: 11 }}
              width={105}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f8fafc" }} />

            {CATEGORIAS.map((c) => (
              <Bar
                key={c.key}
                dataKey={c.key}
                name={c.label}
                stackId="a"
                fill={c.cor}
                fillOpacity={opacity(c.key)}
                radius={c.key === "3_ou_mais" ? [0, 4, 4, 0] : [0, 0, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p className="mt-3 text-xs text-muted-foreground text-right">
        Clique nas categorias para destacar · Percentual sobre total de domicílios do distrito
      </p>
    </div>
  );
}