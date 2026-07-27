import type {
	GpifHitSourceIdentity,
	ImportedDrumHit,
	MidiHitSourceIdentity,
	PersistedGpifDrumHitSource,
	PersistedMidiDrumHitSource,
} from "@chdg/core";
import type { ChdgSourceDocument } from "./projectFileTypes.js";

type Equal<Left, Right> =
	(<Value>() => Value extends Left ? 1 : 2) extends <Value>() =>
		Value extends Right ? 1 : 2
		? true
		: false;

type Expect<Value extends true> = Value;

type ReadonlyKeys<Value extends object> = {
	[Key in keyof Value]-?: Equal<
		Pick<Value, Key>,
		Readonly<Pick<Value, Key>>
	> extends true
		? Key
		: never;
}[keyof Value];

type AllPropertiesReadonly<Value extends object> = Equal<
	ReadonlyKeys<Value>,
	keyof Value
>;

type SourceDocumentIsReadonly = Expect<
	AllPropertiesReadonly<ChdgSourceDocument>
>;
type ImportedHitIsReadonly = Expect<AllPropertiesReadonly<ImportedDrumHit>>;
type MidiIdentityIsReadonly = Expect<
	AllPropertiesReadonly<MidiHitSourceIdentity>
>;
type GpifIdentityIsReadonly = Expect<
	AllPropertiesReadonly<GpifHitSourceIdentity>
>;
type MidiProvenanceIsReadonly = Expect<
	AllPropertiesReadonly<PersistedMidiDrumHitSource>
>;
type GpifProvenanceIsReadonly = Expect<
	AllPropertiesReadonly<PersistedGpifDrumHitSource>
>;
type TempoEntriesAreReadonly = Expect<
	Equal<
		ChdgSourceDocument["tempos"],
		readonly Readonly<ChdgSourceDocument["tempos"][number]>[]
	>
>;
type InputMidiNumbersAreReadonly = Expect<
	Equal<
		NonNullable<PersistedGpifDrumHitSource["inputMidiNumbers"]>,
		readonly number[]
	>
>;

export type {
	GpifIdentityIsReadonly,
	GpifProvenanceIsReadonly,
	ImportedHitIsReadonly,
	InputMidiNumbersAreReadonly,
	MidiIdentityIsReadonly,
	MidiProvenanceIsReadonly,
	SourceDocumentIsReadonly,
	TempoEntriesAreReadonly,
};
