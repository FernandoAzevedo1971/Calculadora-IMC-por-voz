interface Props {
  weightKg: string;
  heightM: string;
  onChangeWeight: (v: string) => void;
  onChangeHeight: (v: string) => void;
}

export function ManualInputs({ weightKg, heightM, onChangeWeight, onChangeHeight }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <label className="block">
        <span className="label">Peso (kg)</span>
        <input
          inputMode="decimal"
          autoComplete="off"
          className="input mt-1"
          value={weightKg}
          onChange={(e) => onChangeWeight(e.target.value)}
          placeholder="ex.: 75"
        />
      </label>
      <label className="block">
        <span className="label">Altura (m)</span>
        <input
          inputMode="decimal"
          autoComplete="off"
          className="input mt-1"
          value={heightM}
          onChange={(e) => onChangeHeight(e.target.value)}
          placeholder="ex.: 1,78"
        />
      </label>
    </div>
  );
}
