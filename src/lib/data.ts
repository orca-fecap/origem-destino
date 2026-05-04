// src/lib/data.ts
import Papa from "papaparse";

export interface DadosVeiculos {
  distrito: string;
  numero_zona: string;
  nenhum: number;
  "1": number;
  "2": number;
  "3_ou_mais": number;
  total: number;
}

export async function carregarDadosVeiculos(): Promise<DadosVeiculos[]> {
  const response = await fetch("/data/df.csv");
  const csvText = await response.text();

  return new Promise((resolve, reject) => {
    Papa.parse<DadosVeiculos>(csvText, {
      header: true,        // primeira linha vira chave
      dynamicTyping: true, // converte números automaticamente
      skipEmptyLines: true,
      complete: (result) => {
        resolve(result.data);
      },
      error: (error: any) => {
        reject(error);
      },
    });
  });
}

export interface DadosFluxo {
  distrito_origem: string;
  distrito_destino: string;
  viagens: number;
}

export async function carregarDadosFluxo(): Promise<DadosFluxo[]> {
  const response = await fetch("/data/viagens_motorizadas.csv");
  const csvText = await response.text();
  return new Promise((resolve, reject) => {
    Papa.parse<DadosFluxo>(csvText, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (result) => resolve(result.data),
      error: (error: any) => reject(error),
    });
  });
}