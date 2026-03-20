import type { CompareOptions, CompareResponse, EvalRecord, EvalsOptions, EvalsResponse, ModelInfo, PromptDiffConfig, UsageResponse } from './types.js';
export declare class PromptDiff {
    private readonly apiKey;
    private readonly baseUrl;
    constructor(config: PromptDiffConfig);
    private buildHeaders;
    private request;
    /**
     * Compare LLM outputs across one or more models for the given prompt.
     *
     * @example
     * const result = await pd.compare({
     *   prompt: 'Summarize in 2 sentences',
     *   models: ['claude-haiku-4-5', 'gpt-4o'],
     * });
     */
    compare(opts: CompareOptions): Promise<CompareResponse>;
    /**
     * List all models available for comparison with their pricing info.
     */
    models(): Promise<ModelInfo[]>;
    /**
     * Retrieve usage statistics for the current billing period.
     */
    usage(): Promise<UsageResponse>;
    /**
     * List past evaluation runs, newest first.
     *
     * @param opts.limit  Max number of records to return (default: 20)
     * @param opts.offset Pagination offset (default: 0)
     */
    evals(opts?: EvalsOptions): Promise<EvalsResponse>;
    /**
     * Retrieve a single evaluation run by its ID.
     *
     * @param evalId The evaluation ID returned from `compare` or `evals`
     */
    eval(evalId: string): Promise<EvalRecord>;
}
//# sourceMappingURL=client.d.ts.map