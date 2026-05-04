import { Separator } from "@/components/ui/separator";
import { FlowDiagram } from "@/components/fluxo/flow-diagram";

export default function FluxoPage() {
  return (
    <main className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Fluxo Urbano</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Viagens motorizadas entre distritos de São Paulo
        </p>
      </div>
      <Separator className="mb-6" />
      <FlowDiagram />
    </main>
  );
}