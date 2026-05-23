export type WaveformBucket = {
	startSeconds: number;
	endSeconds: number;
	min: number;
	max: number;
	rms?: number;
};

export type WaveformOverview = {
	durationSeconds: number;
	sampleRate?: number;
	channels?: number;
	buckets: WaveformBucket[];
};

export type BuildWaveformOverviewInput = {
	channels: Float32Array[];
	durationSeconds: number;
	sampleRate?: number;
	bucketCount?: number;
};

const DEFAULT_BUCKET_COUNT = 900;
const MIN_BUCKET_COUNT = 16;
const MAX_BUCKET_COUNT = 2000;

export function buildWaveformOverview(input: BuildWaveformOverviewInput): WaveformOverview {
	const durationSeconds = Number.isFinite(input.durationSeconds) && input.durationSeconds > 0
		? input.durationSeconds
		: 0;
	const channels = input.channels.filter((channel) => channel.length > 0);
	const channelCount = channels.length;
	const sampleRate = Number.isFinite(input.sampleRate) && (input.sampleRate as number) > 0
		? input.sampleRate
		: undefined;

	if (channelCount === 0 || durationSeconds <= 0) {
		return { durationSeconds, sampleRate, channels: channelCount || undefined, buckets: [] };
	}

	const maxLength = Math.max(...channels.map((channel) => channel.length));
	const bucketCount = clampBucketCount(input.bucketCount ?? DEFAULT_BUCKET_COUNT, maxLength);
	const samplesPerBucket = Math.max(1, Math.ceil(maxLength / bucketCount));
	const buckets: WaveformBucket[] = [];

	for (let index = 0; index < bucketCount; index += 1) {
		const startSample = index * samplesPerBucket;
		const endSampleExclusive = Math.min(maxLength, startSample + samplesPerBucket);
		let min = 0;
		let max = 0;
		let squareSum = 0;
		let count = 0;

		for (let sampleIndex = startSample; sampleIndex < endSampleExclusive; sampleIndex += 1) {
			let mixedSample = 0;
			for (const channel of channels) {
				mixedSample += sanitizeSample(channel[sampleIndex] ?? 0);
			}
			mixedSample /= channelCount;
			if (count === 0) {
				min = mixedSample;
				max = mixedSample;
			} else {
				min = Math.min(min, mixedSample);
				max = Math.max(max, mixedSample);
			}
			squareSum += mixedSample * mixedSample;
			count += 1;
		}

		const startSeconds = (startSample / maxLength) * durationSeconds;
		const endSeconds = (endSampleExclusive / maxLength) * durationSeconds;
		const rms = count > 0 ? Math.sqrt(squareSum / count) : 0;
		buckets.push({
			startSeconds,
			endSeconds,
			min: normalizeAmplitude(min),
			max: normalizeAmplitude(max),
			rms: normalizeRms(rms),
		});
	}

	return {
		durationSeconds,
		sampleRate,
		channels: channelCount,
		buckets,
	};
}

function clampBucketCount(bucketCount: number, maxLength: number): number {
	if (!Number.isFinite(bucketCount)) return Math.min(DEFAULT_BUCKET_COUNT, maxLength);
	const safe = Math.floor(bucketCount);
	const bounded = Math.min(MAX_BUCKET_COUNT, Math.max(MIN_BUCKET_COUNT, safe));
	return Math.min(Math.max(1, maxLength), bounded);
}

function sanitizeSample(sample: number): number {
	if (!Number.isFinite(sample)) return 0;
	if (sample > 1) return 1;
	if (sample < -1) return -1;
	return sample;
}

function normalizeAmplitude(value: number): number {
	if (!Number.isFinite(value)) return 0;
	if (value > 1) return 1;
	if (value < -1) return -1;
	return value;
}

function normalizeRms(value: number): number {
	if (!Number.isFinite(value) || value < 0) return 0;
	if (value > 1) return 1;
	return value;
}
