"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import * as d3 from "d3";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { carregarDadosFluxo, type DadosFluxo } from "@/lib/data";

const LARGURA  = 700;
const ALTURA   = 520;
const MARGEM   = { top: 20, right: 180, bottom: 20, left: 180 };
const TOP_N    = 12; // destinos exibidos

// Escala de cor para os fluxos
const COR_FLUXO = d3.scaleSequential(d3.interpolateBlues).domain([0, 1]);

export function FlowDiagram() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dados, setDados] = useState<DadosFluxo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [origem, setOrigem] = useState<string>("");

  useEffect(() => {
    carregarDadosFluxo()
      .then((d) => {
        setDados(d);
        // default: distrito com mais viagens totais de saída
        const totais = d3.rollup(d, v => d3.sum(v, r => r.viagens), r => r.distrito_origem);
        const top = [...totais.entries()].sort((a, b) => b[1] - a[1])[0];
        if (top) setOrigem(top[0]);
      })
      .catch(console.error)
      .finally(() => setCarregando(false));
  }, []);

  // Lista de origens únicas ordenada
  const origens = useMemo(() =>
    [...new Set(dados.map((d) => d.distrito_origem))].sort((a, b) => a.localeCompare(b)),
    [dados]
  );

  // Top N destinos para a origem selecionada (exclui self-loop)
  const fluxos = useMemo(() => {
    if (!origem) return [];
    return dados
      .filter((d) => d.distrito_origem === origem && d.distrito_destino !== origem)
      .sort((a, b) => b.viagens - a.viagens)
      .slice(0, TOP_N);
  }, [dados, origem]);

  // Self-loop (viagens internas)
  const interno = useMemo(() =>
    dados.find((d) => d.distrito_origem === origem && d.distrito_destino === origem)?.viagens ?? 0,
    [dados, origem]
  );

  // Renderiza o diagrama com D3
  useEffect(() => {
    if (!svgRef.current || !fluxos.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const innerH = ALTURA - MARGEM.top - MARGEM.bottom;
    const g = svg.append("g").attr("transform", `translate(${MARGEM.left},${MARGEM.top})`);

    const totalViagens = d3.sum(fluxos, (d) => d.viagens);
    const maxViagens   = fluxos[0]?.viagens ?? 1;

    // Altura de cada nó destino proporcional às viagens
    const escalaAltura = d3.scaleLinear()
      .domain([0, totalViagens])
      .range([0, innerH * 0.85]);

    const espacamento = innerH / fluxos.length;
    const larguraFluxo = LARGURA - MARGEM.left - MARGEM.right;

    // Nó origem (esquerda)
    const alturaOrigem = innerH * 0.6;
    const yOrigem = (innerH - alturaOrigem) / 2;

    g.append("rect")
      .attr("x", 0).attr("y", yOrigem)
      .attr("width", 12).attr("height", alturaOrigem)
      .attr("fill", "#3b82f6").attr("rx", 3);

    g.append("text")
      .attr("x", -8).attr("y", yOrigem + alturaOrigem / 2)
      .attr("text-anchor", "end").attr("dominant-baseline", "middle")
      .attr("font-size", 13).attr("font-weight", 600).attr("fill", "currentColor")
      .text(origem);

    // Viagens internas
    if (interno > 0) {
      g.append("text")
        .attr("x", -8).attr("y", yOrigem + alturaOrigem / 2 + 16)
        .attr("text-anchor", "end").attr("dominant-baseline", "middle")
        .attr("font-size", 10).attr("fill", "#94a3b8")
        .text(`↺ ${interno.toLocaleString("pt-BR", { maximumFractionDigits: 0 })} internas`);
    }

    // Nós destino + faixas de fluxo
    fluxos.forEach((fluxo, i) => {
      const alturaNo  = Math.max(escalaAltura(fluxo.viagens), 4);
      const yCentro   = espacamento * i + espacamento / 2;
      const yNo       = yCentro - alturaNo / 2;
      const cor       = COR_FLUXO(fluxo.viagens / maxViagens);

      // Faixa curva (path bezier)
      const yOrigemCentro = yOrigem + alturaOrigem * ((i + 0.5) / fluxos.length);
      const xMeio = larguraFluxo / 2;

      g.append("path")
        .attr("d", `
          M 12,${yOrigemCentro - alturaNo / 2}
          C ${xMeio},${yOrigemCentro - alturaNo / 2}
            ${xMeio},${yCentro - alturaNo / 2}
            ${larguraFluxo},${yCentro - alturaNo / 2}
          L ${larguraFluxo},${yCentro + alturaNo / 2}
          C ${xMeio},${yCentro + alturaNo / 2}
            ${xMeio},${yOrigemCentro + alturaNo / 2}
            12,${yOrigemCentro + alturaNo / 2}
          Z
        `)
        .attr("fill", cor)
        .attr("opacity", 0.7)
        .on("mouseenter", function () {
          d3.select(this).attr("opacity", 1);
          tooltip
            .style("display", "block")
            .html(`
              <strong>${fluxo.distrito_destino}</strong><br/>
              ${fluxo.viagens.toLocaleString("pt-BR", { maximumFractionDigits: 0 })} viagens<br/>
              ${((fluxo.viagens / totalViagens) * 100).toFixed(1)}% do total
            `);
        })
        .on("mousemove", function (event) {
          tooltip
            .style("left", `${event.offsetX + 12}px`)
            .style("top",  `${event.offsetY - 28}px`);
        })
        .on("mouseleave", function () {
          d3.select(this).attr("opacity", 0.7);
          tooltip.style("display", "none");
        });

      // Nó destino (direita)
      g.append("rect")
        .attr("x", larguraFluxo).attr("y", yNo)
        .attr("width", 12).attr("height", alturaNo)
        .attr("fill", cor).attr("rx", 3);

      // Label destino
      g.append("text")
        .attr("x", larguraFluxo + 20).attr("y", yCentro)
        .attr("dominant-baseline", "middle")
        .attr("font-size", 11).attr("fill", "currentColor")
        .text(`${fluxo.distrito_destino}`);

      // Valor
      g.append("text")
        .attr("x", larguraFluxo + 20).attr("y", yCentro + 13)
        .attr("dominant-baseline", "middle")
        .attr("font-size", 10).attr("fill", "#94a3b8")
        .text(fluxo.viagens.toLocaleString("pt-BR", { maximumFractionDigits: 0 }));
    });

    // Tooltip div (posicionado em relação ao SVG container)
    const container = d3.select(svgRef.current.parentElement);
    container.selectAll(".d3-tooltip").remove();
    const tooltip = container.append("div")
      .attr("class", "d3-tooltip")
      .style("position", "absolute")
      .style("display", "none")
      .style("background", "white")
      .style("border", "1px solid #e2e8f0")
      .style("border-radius", "6px")
      .style("padding", "8px 12px")
      .style("font-size", "12px")
      .style("pointer-events", "none")
      .style("box-shadow", "0 2px 8px rgba(0,0,0,0.08)");

  }, [fluxos, origem, interno]);

  if (carregando) return (
    <div className="h-[520px] flex items-center justify-center text-muted-foreground text-sm">
      Carregando dados...
    </div>
  );

  return (
    <div>
      {/* Filtro de origem */}
      <div className="flex items-center gap-2 mb-6">
        <span className="text-sm font-medium text-muted-foreground">Distrito de origem:</span>
        <Select value={origem} onValueChange={setOrigem}>
          <SelectTrigger className="w-[240px]">
            <SelectValue placeholder="Escolha um distrito" />
          </SelectTrigger>
          <SelectContent className="max-h-72">
            {origens.map((o) => (
              <SelectItem key={o} value={o}>{o}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground ml-2">
          top {TOP_N} destinos exibidos
        </span>
      </div>

      {/* SVG — posição relativa para o tooltip */}
      <div className="relative w-full overflow-x-auto">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${LARGURA} ${ALTURA}`}
          className="w-full"
          style={{ minWidth: 480 }}
        />
      </div>
    </div>
  );
}