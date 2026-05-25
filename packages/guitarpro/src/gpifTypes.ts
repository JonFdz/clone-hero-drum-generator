export type GpMetadataInspection = {
  title?: string;
  artist?: string;
  album?: string;
  composer?: string;
  copyright?: string;
  tempo?: string | number;
};

export type GpTrackInspection = {
  index: number;
  id?: string;
  name?: string;
  instrument?: string;
  type?: string;
  channel?: number;
  noteCount?: number;
  isDrumCandidate: boolean;
  drumCandidateReasons: string[];
};

export type GpSectionInspection = {
  name: string;
  kind: string;
  measureIndex?: number;
  tick?: number;
  path?: string;
};

export type GpDrumArticulationSummary = {
  name: string;
  count: number;
  trackIndex?: number;
  trackName?: string;
  path?: string;
  rawValue?: string;
};

export type GpInspection = {
  filePath: string;
  format: "gpif";
  gpifPath?: string;
  metadata: GpMetadataInspection;
  tracks: GpTrackInspection[];
  drumTrackCandidates: number[];
  tempos: unknown[];
  timeSignatures: unknown[];
  sections: GpSectionInspection[];
  drumArticulations: GpDrumArticulationSummary[];
  warnings: string[];
  unhandled: string[];
};

export type GpifExtraction = {
  gpifPath: string;
  xml: string;
  entries: string[];
};
